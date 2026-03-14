package com.acadex.communication.repository;

import com.acadex.communication.model.MessageThread;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageThreadRepository extends JpaRepository<MessageThread, UUID> {
    List<MessageThread> findAllByTenantIdAndSenderUserIdOrTenantIdAndRecipientUserIdOrderByCreatedAtDesc(
            UUID tenantIdOne,
            UUID senderUserId,
            UUID tenantIdTwo,
            UUID recipientUserId
    );
}
