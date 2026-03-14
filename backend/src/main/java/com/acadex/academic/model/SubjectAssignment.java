package com.acadex.academic.model;

import com.acadex.tenant.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "subject_assignments")
public class SubjectAssignment extends TenantScopedEntity {

    @Column(nullable = false)
    private UUID subjectId;

    @Column(nullable = false)
    private UUID teacherId;

    @Column(nullable = false)
    private UUID classId;

    public UUID getSubjectId() { return subjectId; }
    public void setSubjectId(UUID subjectId) { this.subjectId = subjectId; }
    public UUID getTeacherId() { return teacherId; }
    public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }
    public UUID getClassId() { return classId; }
    public void setClassId(UUID classId) { this.classId = classId; }
}
