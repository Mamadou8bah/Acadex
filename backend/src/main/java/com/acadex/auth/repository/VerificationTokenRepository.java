package com.acadex.auth.repository;

import com.acadex.auth.model.VerificationToken;
import com.acadex.auth.model.VerificationTokenType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {
    Optional<VerificationToken> findByTokenHashAndType(String tokenHash, VerificationTokenType type);
}
