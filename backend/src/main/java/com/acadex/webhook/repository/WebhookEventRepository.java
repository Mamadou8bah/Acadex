package com.acadex.webhook.repository;

import com.acadex.webhook.model.WebhookEvent;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, UUID> {
    Optional<WebhookEvent> findByExternalEventId(String externalEventId);
}
