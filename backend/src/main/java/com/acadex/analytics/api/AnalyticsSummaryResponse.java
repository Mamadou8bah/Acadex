package com.acadex.analytics.api;

public record AnalyticsSummaryResponse(
        long totalSchools,
        long totalUsersForTenant,
        long pendingNotificationsForTenant,
        long announcementsForTenant
) {
}
