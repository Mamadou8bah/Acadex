package com.acadex.webhook.api;

public record WebhookResponse(boolean processed, String message) {
}
