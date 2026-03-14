package com.acadex.notification.service;

import com.acadex.notification.api.CreateInAppNotificationRequest;
import com.acadex.notification.api.NotificationResponse;
import com.acadex.notification.model.NotificationChannel;
import com.acadex.notification.model.NotificationOutbox;
import com.acadex.notification.repository.NotificationOutboxRepository;
import com.acadex.tenant.TenantAccessService;
import java.util.List;
import java.util.UUID;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationOutboxRepository notificationOutboxRepository;
    private final RabbitTemplate rabbitTemplate;
    private final TenantAccessService tenantAccessService;

    public NotificationService(
            NotificationOutboxRepository notificationOutboxRepository,
            RabbitTemplate rabbitTemplate,
            TenantAccessService tenantAccessService
    ) {
        this.notificationOutboxRepository = notificationOutboxRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.tenantAccessService = tenantAccessService;
    }

    @Transactional
    public void queueEmail(UUID tenantId, UUID recipientUserId, String subject, String content) {
        NotificationOutbox notification = new NotificationOutbox();
        notification.setTenantId(tenantId);
        notification.setRecipientUserId(recipientUserId);
        notification.setChannel(NotificationChannel.EMAIL);
        notification.setSubject(subject);
        notification.setContent(content);
        NotificationOutbox saved = notificationOutboxRepository.save(notification);
        rabbitTemplate.convertAndSend(
                "acadex.notifications",
                new NotificationJob(saved.getId(), tenantId, recipientUserId, subject, content)
        );
    }

    @Transactional
    public NotificationResponse queueInApp(CreateInAppNotificationRequest request) {
        UUID tenantId = tenantAccessService.requireTenant();
        NotificationOutbox notification = new NotificationOutbox();
        notification.setTenantId(tenantId);
        notification.setRecipientUserId(request.recipientUserId());
        notification.setChannel(NotificationChannel.IN_APP);
        notification.setSubject(request.subject());
        notification.setContent(request.content());
        notification = notificationOutboxRepository.save(notification);
        return new NotificationResponse(notification.getId(), notification.getRecipientUserId(), notification.getChannel(), notification.getStatus(), notification.getSubject(), notification.getContent());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> recentInApp() {
        UUID tenantId = tenantAccessService.requireTenant();
        return notificationOutboxRepository.findTop20ByTenantIdAndChannelOrderByCreatedAtDesc(tenantId, NotificationChannel.IN_APP).stream()
                .map(item -> new NotificationResponse(item.getId(), item.getRecipientUserId(), item.getChannel(), item.getStatus(), item.getSubject(), item.getContent()))
                .toList();
    }
}
