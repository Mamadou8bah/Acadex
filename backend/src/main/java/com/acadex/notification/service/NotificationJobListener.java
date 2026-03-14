package com.acadex.notification.service;

import com.acadex.email.service.EmailService;
import com.acadex.notification.model.NotificationStatus;
import com.acadex.notification.repository.NotificationOutboxRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class NotificationJobListener {

    private final NotificationOutboxRepository notificationOutboxRepository;
    private final EmailService emailService;

    public NotificationJobListener(NotificationOutboxRepository notificationOutboxRepository, EmailService emailService) {
        this.notificationOutboxRepository = notificationOutboxRepository;
        this.emailService = emailService;
    }

    @RabbitListener(queues = "${app.queues.notifications:acadex.notifications}")
    @Transactional
    public void consume(NotificationJob job) {
        notificationOutboxRepository.findById(job.notificationId()).ifPresent(notification -> {
            emailService.sendEmail("queued-user-" + job.recipientUserId() + "@acadex.local", job.subject(), job.content());
            notification.setStatus(NotificationStatus.SENT);
        });
    }
}
