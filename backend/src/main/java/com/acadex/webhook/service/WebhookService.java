package com.acadex.webhook.service;

import com.acadex.webhook.api.PaymentWebhookRequest;
import com.acadex.webhook.api.WebhookResponse;
import com.acadex.webhook.model.WebhookEvent;
import com.acadex.webhook.repository.WebhookEventRepository;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebhookService {

    private final WebhookEventRepository webhookEventRepository;

    public WebhookService(WebhookEventRepository webhookEventRepository) {
        this.webhookEventRepository = webhookEventRepository;
    }

    @Transactional
    public WebhookResponse processPaymentWebhook(PaymentWebhookRequest request) {
        if (webhookEventRepository.findByExternalEventId(request.eventId()).isPresent()) {
            return new WebhookResponse(false, "Webhook already processed");
        }

        WebhookEvent event = new WebhookEvent();
        event.setExternalEventId(request.eventId());
        event.setSource(request.source());
        event.setPayload(request.payload());
        event.setProcessedAt(OffsetDateTime.now());
        webhookEventRepository.save(event);
        return new WebhookResponse(true, "Webhook processed successfully");
    }
}
