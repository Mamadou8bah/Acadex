package com.acadex.auth.service;

import com.acadex.audit.service.AuditService;
import com.acadex.user.model.UserAccount;
import com.acadex.user.repository.UserAccountRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AuthAuditService {

    private static final UUID PLATFORM_ACTOR_ID = new UUID(0L, 0L);

    private final UserAccountRepository userAccountRepository;
    private final AuditService auditService;

    public AuthAuditService(UserAccountRepository userAccountRepository, AuditService auditService) {
        this.userAccountRepository = userAccountRepository;
        this.auditService = auditService;
    }

    public void logFailedLogin(String email, String reason) {
        userAccountRepository.findByEmail(email)
                .ifPresentOrElse(
                        user -> logForKnownUser(user, reason),
                        () -> auditService.log(null, PLATFORM_ACTOR_ID, "LOGIN_FAILED", "UserAccount", email, reason)
                );
    }

    private void logForKnownUser(UserAccount user, String reason) {
        auditService.log(
                user.getTenantId(),
                user.getId(),
                "LOGIN_FAILED",
                "UserAccount",
                user.getId().toString(),
                reason
        );
    }
}
