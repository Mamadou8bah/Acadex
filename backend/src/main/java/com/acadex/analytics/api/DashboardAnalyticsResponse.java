package com.acadex.analytics.api;

public record DashboardAnalyticsResponse(
        long studentEnrollments,
        long classesCount,
        long presentAttendanceRecords,
        long absentAttendanceRecords,
        long lateAttendanceRecords,
        double totalInvoiced,
        double totalCollected,
        double outstandingBalance,
        double feeCollectionRate,
        long examsCount,
        long teacherAssignments,
        double averageScore,
        long scoredStudents,
        long recentEnrollmentCount,
        long teachersWithAssignments,
        double averageAssignmentsPerTeacher
) {
}
