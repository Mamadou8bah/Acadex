package com.acadex.attendance.api;

import com.acadex.attendance.model.AttendanceStatus;
import java.time.LocalDate;
import java.util.UUID;

public final class AttendanceRequests {
    private AttendanceRequests() {}

    public record MarkAttendanceRequest(UUID studentId, UUID classId, LocalDate attendanceDate, AttendanceStatus status) {}
}
