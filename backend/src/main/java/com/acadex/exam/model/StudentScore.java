package com.acadex.exam.model;

import com.acadex.tenant.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "student_scores")
public class StudentScore extends TenantScopedEntity {

    @Column(nullable = false)
    private UUID examId;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private double score;

    public UUID getExamId() { return examId; }
    public void setExamId(UUID examId) { this.examId = examId; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
}
