package com.acadex.notification.repository;

import com.acadex.notification.model.NotificationOutbox;
import com.acadex.notification.model.NotificationChannel;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, UUID> {
    long countByTenantId(UUID tenantId);
    List<NotificationOutbox> findTop10ByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    List<NotificationOutbox> findTop20ByTenantIdAndChannelOrderByCreatedAtDesc(UUID tenantId, NotificationChannel channel);
    List<NotificationOutbox> findTop20ByTenantIdAndRecipientUserIdAndChannelOrderByCreatedAtDesc(
            UUID tenantId,
            UUID recipientUserId,
            NotificationChannel channel
    );
}
