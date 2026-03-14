package com.acadex.school.api;

import java.util.UUID;

public record TenantUsageResponse(
        UUID schoolId,
        long users,
        long announcements,
        long notifications,
        long classesCount,
        long enrollments
) {
}
