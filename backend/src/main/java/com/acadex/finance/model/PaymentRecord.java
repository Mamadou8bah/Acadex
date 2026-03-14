package com.acadex.finance.model;

import com.acadex.tenant.TenantScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_records")
public class PaymentRecord extends TenantScopedEntity {

    @Column(nullable = false)
    private UUID invoiceId;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(nullable = false)
    private OffsetDateTime paidAt;

    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public OffsetDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(OffsetDateTime paidAt) { this.paidAt = paidAt; }
}
