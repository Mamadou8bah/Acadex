package com.acadex.notification.service;

import java.io.Serializable;
import java.util.UUID;

public record NotificationJob(
        UUID notificationId,
        UUID tenantId,
        UUID recipientUserId,
        String subject,
        String content
) implements Serializable {
}
