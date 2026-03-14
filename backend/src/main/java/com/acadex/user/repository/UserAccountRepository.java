package com.acadex.user.repository;

import com.acadex.user.model.UserAccount;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmail(String email);
    List<UserAccount> findAllByTenantId(UUID tenantId);
    long countByTenantId(UUID tenantId);
    Page<UserAccount> findAllByTenantId(UUID tenantId, Pageable pageable);
}
