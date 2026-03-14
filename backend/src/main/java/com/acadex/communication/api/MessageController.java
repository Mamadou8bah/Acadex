package com.acadex.communication.api;

import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.communication.api.MessageRequests.SendMessageRequest;
import com.acadex.communication.service.MessageService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('PARENT') or hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public MessageResponse send(@RequestBody SendMessageRequest request, @AuthenticationPrincipal AcadexUserPrincipal principal) {
        return messageService.send(request, principal);
    }

    @GetMapping
    public List<MessageResponse> inbox(@AuthenticationPrincipal AcadexUserPrincipal principal) {
        return messageService.inbox(principal);
    }
}
