package com.acadex.communication.service;

import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.communication.api.MessageRequests.SendMessageRequest;
import com.acadex.communication.api.MessageResponse;
import com.acadex.communication.model.MessageThread;
import com.acadex.communication.repository.MessageThreadRepository;
import com.acadex.notification.api.CreateInAppNotificationRequest;
import com.acadex.notification.service.NotificationService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

    private final MessageThreadRepository messageThreadRepository;
    private final NotificationService notificationService;

    public MessageService(MessageThreadRepository messageThreadRepository, NotificationService notificationService) {
        this.messageThreadRepository = messageThreadRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public MessageResponse send(SendMessageRequest request, AcadexUserPrincipal principal) {
        MessageThread message = new MessageThread();
        message.setTenantId(principal.getTenantId());
        message.setSenderUserId(principal.getUserId());
        message.setRecipientUserId(request.recipientUserId());
        message.setBody(request.body());
        messageThreadRepository.save(message);
        notificationService.queueInApp(new CreateInAppNotificationRequest(request.recipientUserId(), "New message", request.body()));
        return new MessageResponse(message.getId(), message.getSenderUserId(), message.getRecipientUserId(), message.getBody());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> inbox(AcadexUserPrincipal principal) {
        return messageThreadRepository.findAllByTenantIdAndSenderUserIdOrTenantIdAndRecipientUserIdOrderByCreatedAtDesc(
                        principal.getTenantId(), principal.getUserId(), principal.getTenantId(), principal.getUserId())
                .stream()
                .map(item -> new MessageResponse(item.getId(), item.getSenderUserId(), item.getRecipientUserId(), item.getBody()))
                .toList();
    }
}
