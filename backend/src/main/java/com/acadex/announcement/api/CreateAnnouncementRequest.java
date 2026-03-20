package com.acadex.announcement.api;

import com.acadex.announcement.model.AnnouncementAudience;
import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateAnnouncementRequest(
        @NotBlank String title,
        @NotBlank String content,
        AnnouncementAudience audience,
        UUID classId,
        OffsetDateTime publishAt
) {
}
