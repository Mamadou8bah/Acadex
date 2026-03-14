package com.acadex.analytics.api;

public record DashboardAnalyticsResponse(
        long studentEnrollments,
        long classesCount,
        long presentAttendanceRecords,
        long absentAttendanceRecords,
        double totalInvoiced,
        double totalCollected,
        long examsCount,
        long teacherAssignments
) {
}
