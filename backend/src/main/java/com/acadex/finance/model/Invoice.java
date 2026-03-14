package com.acadex.finance.model;

import com.acadex.tenant.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices")
public class Invoice extends TenantScopedEntity {

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private UUID feeStructureId;

    @Column(nullable = false)
    private double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private OffsetDateTime generatedAt;

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public UUID getFeeStructureId() { return feeStructureId; }
    public void setFeeStructureId(UUID feeStructureId) { this.feeStructureId = feeStructureId; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public OffsetDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(OffsetDateTime generatedAt) { this.generatedAt = generatedAt; }
}
