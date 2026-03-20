package com.acadex.auth.service;

import com.acadex.audit.service.AuditService;
import com.acadex.auth.api.AuthResponse;
import com.acadex.auth.api.AuthUserResponse;
import com.acadex.auth.api.ForgotPasswordRequest;
import com.acadex.auth.api.LoginRequest;
import com.acadex.auth.api.MessageResponse;
import com.acadex.auth.api.RefreshTokenRequest;
import com.acadex.auth.api.RegisterSchoolAdminRequest;
import com.acadex.auth.api.ResetPasswordRequest;
import com.acadex.auth.api.VerifyEmailRequest;
import com.acadex.auth.model.RefreshToken;
import com.acadex.auth.model.VerificationToken;
import com.acadex.auth.model.VerificationTokenType;
import com.acadex.auth.repository.RefreshTokenRepository;
import com.acadex.auth.repository.VerificationTokenRepository;
import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.auth.security.JwtService;
import com.acadex.email.service.EmailService;
import com.acadex.school.model.School;
import com.acadex.school.model.SubscriptionPlan;
import com.acadex.school.repository.SchoolRepository;
import com.acadex.user.model.PlatformRole;
import com.acadex.user.model.UserAccount;
import com.acadex.user.repository.UserAccountRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final SchoolRepository schoolRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuditService auditService;
    private final AuthenticationManager authenticationManager;
    private final AuthAuditService authAuditService;

    public AuthService(
            UserAccountRepository userAccountRepository,
            SchoolRepository schoolRepository,
            RefreshTokenRepository refreshTokenRepository,
            VerificationTokenRepository verificationTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            AuditService auditService,
            AuthenticationManager authenticationManager,
            AuthAuditService authAuditService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.schoolRepository = schoolRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.auditService = auditService;
        this.authenticationManager = authenticationManager;
        this.authAuditService = authAuditService;
    }

    @Transactional
    public MessageResponse registerSchoolAdmin(RegisterSchoolAdminRequest request) {
        School school = new School();
        school.setName(request.schoolName());
        school.setSlug(request.schoolSlug());
        school.setContactEmail(request.schoolEmail());
        school.setSubscriptionPlan(request.subscriptionPlan() == null ? SubscriptionPlan.STARTER : request.subscriptionPlan());
        school = schoolRepository.save(school);

        UserAccount user = new UserAccount();
        user.setTenantId(school.getId());
        user.setFirstName(request.adminFirstName());
        user.setLastName(request.adminLastName());
        user.setEmail(request.adminEmail());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(PlatformRole.SCHOOL_ADMIN);
        user.setActive(true);
        user.setEmailVerified(false);
        userAccountRepository.save(user);

        String emailToken = createVerificationToken(user, VerificationTokenType.EMAIL_VERIFICATION, 24);
        emailService.sendEmail(
                user.getEmail(),
                "Verify your Acadex account",
                "<p>Welcome to Acadex.</p><p>Your verification token is <strong>" + emailToken + "</strong>.</p>"
        );

        auditService.log(school.getId(), user.getId(), "REGISTER_SCHOOL_ADMIN", "UserAccount", user.getId().toString(), user.getEmail());
        return new MessageResponse("Registration successful. Verify the email before logging in.");
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        UserAccount user;
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
            AcadexUserPrincipal principal = (AcadexUserPrincipal) authentication.getPrincipal();
            user = userAccountRepository.findByEmail(principal.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        } catch (BadCredentialsException ex) {
            authAuditService.logFailedLogin(request.email(), "Invalid credentials");
            throw ex;
        }

        if (!user.isEmailVerified()) {
            authAuditService.logFailedLogin(request.email(), "Email not verified");
            throw new BadCredentialsException("Email not verified");
        }

        user.setLastLoginAt(OffsetDateTime.now());
        String refreshTokenValue = UUID.randomUUID() + "." + UUID.randomUUID();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(user.getId());
        refreshToken.setTokenHash(hash(refreshTokenValue));
        refreshToken.setExpiresAt(OffsetDateTime.now().plusDays(jwtService.getRefreshTokenDays()));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);

        auditService.log(user.getTenantId(), user.getId(), "LOGIN_SUCCESS", "UserAccount", user.getId().toString(), user.getEmail());
        return new AuthResponse(jwtService.generateAccessToken(user), refreshTokenValue, mapUser(user));
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(hash(request.refreshToken()))
                .filter(token -> !token.isRevoked() && token.getExpiresAt().isAfter(OffsetDateTime.now()))
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        UserAccount user = userAccountRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        return new AuthResponse(jwtService.generateAccessToken(user), request.refreshToken(), mapUser(user));
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        userAccountRepository.findByEmail(request.email()).ifPresent(user -> {
            String token = createVerificationToken(user, VerificationTokenType.PASSWORD_RESET, 2);
            emailService.sendEmail(
                    user.getEmail(),
                    "Acadex password reset",
                    "<p>Your password reset token is <strong>" + token + "</strong>.</p>"
            );
        });
        return new MessageResponse("If the account exists, a password reset message has been sent.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        VerificationToken token = verificationTokenRepository
                .findByTokenHashAndType(hash(request.token()), VerificationTokenType.PASSWORD_RESET)
                .filter(item -> item.getUsedAt() == null && item.getExpiresAt().isAfter(OffsetDateTime.now()))
                .orElseThrow(() -> new BadCredentialsException("Invalid reset token"));

        UserAccount user = userAccountRepository.findById(token.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        token.setUsedAt(OffsetDateTime.now());
        auditService.log(user.getTenantId(), user.getId(), "PASSWORD_RESET", "UserAccount", user.getId().toString(), user.getEmail());
        return new MessageResponse("Password updated successfully.");
    }

    @Transactional
    public MessageResponse verifyEmail(VerifyEmailRequest request) {
        VerificationToken token = verificationTokenRepository
                .findByTokenHashAndType(hash(request.token()), VerificationTokenType.EMAIL_VERIFICATION)
                .filter(item -> item.getUsedAt() == null && item.getExpiresAt().isAfter(OffsetDateTime.now()))
                .orElseThrow(() -> new BadCredentialsException("Invalid verification token"));

        UserAccount user = userAccountRepository.findById(token.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        user.setEmailVerified(true);
        token.setUsedAt(OffsetDateTime.now());
        auditService.log(user.getTenantId(), user.getId(), "EMAIL_VERIFIED", "UserAccount", user.getId().toString(), user.getEmail());
        return new MessageResponse("Email verified successfully.");
    }

    @Transactional(readOnly = true)
    public AuthUserResponse currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AcadexUserPrincipal principal)) {
            throw new BadCredentialsException("Unauthenticated");
        }
        UserAccount user = userAccountRepository.findById(principal.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        return mapUser(user);
    }

    private String createVerificationToken(UserAccount user, VerificationTokenType type, long hours) {
        String plainToken = UUID.randomUUID() + "-" + UUID.randomUUID();
        VerificationToken token = new VerificationToken();
        token.setUserId(user.getId());
        token.setType(type);
        token.setTokenHash(hash(plainToken));
        token.setExpiresAt(OffsetDateTime.now().plusHours(hours));
        verificationTokenRepository.save(token);
        return plainToken;
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }

    private AuthUserResponse mapUser(UserAccount user) {
        return new AuthUserResponse(
                user.getId(),
                user.getTenantId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.isEmailVerified()
        );
    }
}
