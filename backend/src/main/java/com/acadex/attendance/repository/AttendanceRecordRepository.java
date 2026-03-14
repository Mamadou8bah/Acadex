package com.acadex.attendance.repository;

import com.acadex.attendance.model.AttendanceRecord;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findAllByTenantIdAndStudentIdOrderByAttendanceDateDesc(UUID tenantId, UUID studentId);
    List<AttendanceRecord> findAllByTenantIdAndClassIdAndAttendanceDateBetween(UUID tenantId, UUID classId, LocalDate startDate, LocalDate endDate);
    long countByTenantIdAndStatus(UUID tenantId, com.acadex.attendance.model.AttendanceStatus status);
}
