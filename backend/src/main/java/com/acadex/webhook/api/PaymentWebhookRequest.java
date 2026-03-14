package com.acadex.webhook.api;

import jakarta.validation.constraints.NotBlank;

public record PaymentWebhookRequest(
        @NotBlank String eventId,
        @NotBlank String source,
        @NotBlank String payload
) {
}
