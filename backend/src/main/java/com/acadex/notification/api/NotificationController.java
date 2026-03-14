package com.acadex.notification.api;

import com.acadex.notification.service.NotificationService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/in-app")
    public List<NotificationResponse> recentInApp() {
        return notificationService.recentInApp();
    }

    @PostMapping("/in-app")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN') or hasRole('TEACHER')")
    public NotificationResponse createInApp(@RequestBody CreateInAppNotificationRequest request) {
        return notificationService.queueInApp(request);
    }
}
