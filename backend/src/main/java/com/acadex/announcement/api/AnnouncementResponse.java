package com.acadex.announcement.api;

import com.acadex.announcement.model.AnnouncementAudience;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AnnouncementResponse(
        UUID id,
        UUID tenantId,
        UUID authorId,
        String title,
        String content,
        AnnouncementAudience audience,
        OffsetDateTime publishAt
) {
}
