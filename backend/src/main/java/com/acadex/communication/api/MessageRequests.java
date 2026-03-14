package com.acadex.communication.api;

import java.util.UUID;

public final class MessageRequests {
    private MessageRequests() {}

    public record SendMessageRequest(UUID recipientUserId, String body) {}
}
