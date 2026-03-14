package com.acadex.notification.api;

import com.acadex.notification.model.NotificationChannel;
import com.acadex.notification.model.NotificationStatus;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID recipientUserId,
        NotificationChannel channel,
        NotificationStatus status,
        String subject,
        String content
) {
}
