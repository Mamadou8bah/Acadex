package com.acadex.webhook.api;

import com.acadex.webhook.service.WebhookService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentWebhookController {

    private final WebhookService webhookService;

    public PaymentWebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/webhook")
    public WebhookResponse processWebhook(@Valid @RequestBody PaymentWebhookRequest request) {
        return webhookService.processPaymentWebhook(request);
    }
}
