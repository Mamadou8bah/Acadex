package com.acadex.notification.api;

import java.util.UUID;

public record CreateInAppNotificationRequest(UUID recipientUserId, String subject, String content) {
}
