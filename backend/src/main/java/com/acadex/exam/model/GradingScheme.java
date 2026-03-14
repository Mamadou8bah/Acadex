package com.acadex.exam.model;

import com.acadex.tenant.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "grading_schemes")
public class GradingScheme extends TenantScopedEntity {

    @Column(nullable = false)
    private double minScore;

    @Column(nullable = false)
    private double maxScore;

    @Column(nullable = false)
    private String letterGrade;

    @Column(nullable = false)
    private double gradePoint;

    public double getMinScore() { return minScore; }
    public void setMinScore(double minScore) { this.minScore = minScore; }
    public double getMaxScore() { return maxScore; }
    public void setMaxScore(double maxScore) { this.maxScore = maxScore; }
    public String getLetterGrade() { return letterGrade; }
    public void setLetterGrade(String letterGrade) { this.letterGrade = letterGrade; }
    public double getGradePoint() { return gradePoint; }
    public void setGradePoint(double gradePoint) { this.gradePoint = gradePoint; }
}
