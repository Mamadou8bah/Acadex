package com.acadex.finance.service;

import com.acadex.finance.model.InvoiceStatus;
import com.acadex.finance.repository.InvoiceRepository;
import com.acadex.notification.service.NotificationService;
import java.time.LocalDate;
import java.util.EnumSet;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class FeeReminderScheduler {

    private final InvoiceRepository invoiceRepository;
    private final NotificationService notificationService;

    public FeeReminderScheduler(InvoiceRepository invoiceRepository, NotificationService notificationService) {
        this.invoiceRepository = invoiceRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "${app.scheduling.fee-reminders:0 0 8 * * *}")
    @Transactional
    public void sendDueAndOverdueReminders() {
        LocalDate today = LocalDate.now();
        invoiceRepository.findAll().stream()
                .filter(invoice -> EnumSet.of(InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE).contains(invoice.getStatus()))
                .forEach(invoice -> {
                    if (invoice.getDueDate().isBefore(today) && invoice.getStatus() != InvoiceStatus.OVERDUE) {
                        invoice.setStatus(InvoiceStatus.OVERDUE);
                    }

                    if (!invoice.getDueDate().isAfter(today.plusDays(3))) {
                        String subject = invoice.getStatus() == InvoiceStatus.OVERDUE ? "Fee overdue reminder" : "Upcoming fee reminder";
                        String content = invoice.getStatus() == InvoiceStatus.OVERDUE
                                ? "Your invoice is overdue. Please settle the outstanding school fee."
                                : "Your school fee is due soon. Please make payment before the deadline.";
                        notificationService.queueEmail(invoice.getTenantId(), invoice.getStudentId(), subject, content);
                    }
                });
    }
}
