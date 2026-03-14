package com.acadex.attendance.api;

import com.acadex.attendance.api.AttendanceRequests.MarkAttendanceRequest;
import com.acadex.attendance.api.AttendanceResponses.AttendanceRecordResponse;
import com.acadex.attendance.api.AttendanceResponses.AttendanceReportResponse;
import com.acadex.attendance.service.AttendanceService;
import com.acadex.auth.security.AcadexUserPrincipal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/records")
    @PreAuthorize("hasRole('TEACHER') or hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public AttendanceRecordResponse mark(@RequestBody MarkAttendanceRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return attendanceService.markAttendance(request, principal.getUserId());
    }

    @GetMapping("/students/{studentId}/history")
    public List<AttendanceRecordResponse> history(@PathVariable UUID studentId) {
        return attendanceService.history(studentId);
    }

    @GetMapping("/classes/{classId}/report")
    public AttendanceReportResponse report(
            @PathVariable UUID classId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return attendanceService.report(classId, startDate, endDate);
    }
}
