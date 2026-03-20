package com.acadex.notification.service;

import com.acadex.email.service.EmailService;
import com.acadex.notification.model.NotificationStatus;
import com.acadex.notification.repository.NotificationOutboxRepository;
import com.acadex.user.repository.UserAccountRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class NotificationJobListener {

    private final NotificationOutboxRepository notificationOutboxRepository;
    private final EmailService emailService;
    private final UserAccountRepository userAccountRepository;

    public NotificationJobListener(
            NotificationOutboxRepository notificationOutboxRepository,
            EmailService emailService,
            UserAccountRepository userAccountRepository
    ) {
        this.notificationOutboxRepository = notificationOutboxRepository;
        this.emailService = emailService;
        this.userAccountRepository = userAccountRepository;
    }

    @RabbitListener(queues = "${app.queues.notifications:acadex.notifications}")
    @Transactional
    public void consume(NotificationJob job) {
        notificationOutboxRepository.findById(job.notificationId()).ifPresent(notification -> {
            userAccountRepository.findById(job.recipientUserId()).ifPresentOrElse(user -> {
                emailService.sendEmail(user.getEmail(), job.subject(), job.content());
                notification.setStatus(NotificationStatus.SENT);
            }, () -> notification.setStatus(NotificationStatus.FAILED));
        });
    }
}
