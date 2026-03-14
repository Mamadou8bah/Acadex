package com.acadex.attendance.api;

import com.acadex.attendance.model.AttendanceStatus;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public final class AttendanceResponses {
    private AttendanceResponses() {}

    public record AttendanceRecordResponse(UUID id, UUID studentId, UUID classId, LocalDate attendanceDate, AttendanceStatus status, UUID markedByUserId) {}
    public record AttendanceReportResponse(UUID classId, LocalDate startDate, LocalDate endDate, long totalRecords, Map<AttendanceStatus, Long> byStatus) {}
}
