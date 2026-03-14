package com.acadex.communication.api;

import java.util.UUID;

public record MessageResponse(UUID id, UUID senderUserId, UUID recipientUserId, String body) {
}
