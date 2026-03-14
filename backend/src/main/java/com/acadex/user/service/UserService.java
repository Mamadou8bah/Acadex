package com.acadex.user.service;

import com.acadex.audit.service.AuditService;
import com.acadex.auth.model.VerificationTokenType;
import com.acadex.auth.repository.VerificationTokenRepository;
import com.acadex.common.api.PageResponse;
import com.acadex.email.service.EmailService;
import com.acadex.tenant.TenantAccessService;
import com.acadex.user.api.CreateUserRequest;
import com.acadex.user.api.ProfileUpdateRequest;
import com.acadex.user.api.UpdateUserRequest;
import com.acadex.user.api.UserResponse;
import com.acadex.user.model.UserAccount;
import com.acadex.user.repository.UserAccountRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.acadex.auth.model.VerificationToken;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final AuditService auditService;
    private final TenantAccessService tenantAccessService;

    public UserService(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            VerificationTokenRepository verificationTokenRepository,
            AuditService auditService,
            TenantAccessService tenantAccessService
    ) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.verificationTokenRepository = verificationTokenRepository;
        this.auditService = auditService;
        this.tenantAccessService = tenantAccessService;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> listUsers(int page, int size) {
        UUID tenantId = tenantAccessService.requireTenant();
        Page<UserAccount> users = userAccountRepository.findAllByTenantId(tenantId, PageRequest.of(page, size));
        return new PageResponse<>(
                users.getContent().stream().map(this::map).toList(),
                users.getNumber(),
                users.getSize(),
                users.getTotalElements(),
                users.getTotalPages()
        );
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        String temporaryPassword = "Acadex@" + UUID.randomUUID().toString().substring(0, 8);

        UserAccount user = new UserAccount();
        user.setTenantId(tenantId);
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setRole(request.role());
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setActive(true);
        user.setEmailVerified(false);
        user = userAccountRepository.save(user);

        String emailToken = createVerificationToken(user);
        emailService.sendEmail(
                user.getEmail(),
                "You've been invited to Acadex",
                "<p>Your temporary password is <strong>" + temporaryPassword + "</strong>.</p><p>Verification token: <strong>" + emailToken + "</strong>.</p>"
        );
        auditService.log(tenantId, actorId, "USER_CREATED", "UserAccount", user.getId().toString(), user.getEmail());
        return map(user);
    }

    @Transactional
    public UserResponse updateUser(UUID userId, UpdateUserRequest request, UUID actorId) {
        UserAccount user = userAccountRepository.findById(userId).orElseThrow();
        tenantAccessService.ensureMatches(user.getTenantId());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        if (request.role() != null) {
            user.setRole(request.role());
        }
        user.setActive(request.active());
        auditService.log(user.getTenantId(), actorId, "ROLE_CHANGED", "UserAccount", user.getId().toString(), user.getRole().name());
        return map(user);
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
        UserAccount user = userAccountRepository.findById(userId).orElseThrow();
        tenantAccessService.ensureMatches(user.getTenantId());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        return map(user);
    }

    @Transactional
    public UserResponse setActive(UUID userId, boolean active, UUID actorId) {
        UserAccount user = userAccountRepository.findById(userId).orElseThrow();
        tenantAccessService.ensureMatches(user.getTenantId());
        user.setActive(active);
        auditService.log(user.getTenantId(), actorId, active ? "USER_ACTIVATED" : "USER_DEACTIVATED", "UserAccount", userId.toString(), user.getEmail());
        return map(user);
    }

    @Transactional
    public void deleteUser(UUID userId, UUID actorId) {
        UserAccount user = userAccountRepository.findById(userId).orElseThrow();
        tenantAccessService.ensureMatches(user.getTenantId());
        userAccountRepository.delete(user);
        auditService.log(user.getTenantId(), actorId, "STUDENT_DELETION", "UserAccount", userId.toString(), user.getEmail());
    }

    @Transactional
    public int bulkUploadStudents(MultipartFile file, UUID actorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        try {
            int created = 0;
            String csv = new String(file.getBytes(), StandardCharsets.UTF_8);
            for (String line : csv.split("\\r?\\n")) {
                if (line.isBlank() || line.toLowerCase().startsWith("first")) {
                    continue;
                }
                String[] parts = line.split(",");
                if (parts.length < 3) {
                    continue;
                }
                UserAccount student = new UserAccount();
                student.setTenantId(tenantId);
                student.setFirstName(parts[0].trim());
                student.setLastName(parts[1].trim());
                student.setEmail(parts[2].trim());
                student.setRole(com.acadex.user.model.PlatformRole.STUDENT);
                student.setPasswordHash(passwordEncoder.encode("Acadex@" + UUID.randomUUID().toString().substring(0, 8)));
                student.setActive(true);
                student.setEmailVerified(false);
                userAccountRepository.save(student);
                created++;
            }
            auditService.log(tenantId, actorId, "BULK_STUDENT_UPLOAD", "UserAccount", tenantId.toString(), String.valueOf(created));
            return created;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid CSV upload", ex);
        }
    }

    private String createVerificationToken(UserAccount user) {
        String plainToken = UUID.randomUUID() + "-" + UUID.randomUUID();
        VerificationToken token = new VerificationToken();
        token.setUserId(user.getId());
        token.setType(VerificationTokenType.EMAIL_VERIFICATION);
        token.setTokenHash(hash(plainToken));
        token.setExpiresAt(OffsetDateTime.now().plusHours(24));
        verificationTokenRepository.save(token);
        return plainToken;
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private UserResponse map(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getTenantId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.isActive(),
                user.isEmailVerified()
        );
    }
}
