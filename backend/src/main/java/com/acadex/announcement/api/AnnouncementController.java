package com.acadex.announcement.api;

import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.announcement.service.AnnouncementService;
import com.acadex.common.api.PageResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public PageResponse<AnnouncementResponse> listAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal AcadexUserPrincipal principal
    ) {
        return announcementService.listAnnouncements(page, size, principal);
    }

    @PostMapping
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN') or hasRole('TEACHER')")
    public AnnouncementResponse createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request,
            @AuthenticationPrincipal AcadexUserPrincipal principal
    ) {
        return announcementService.createAnnouncement(request, principal.getUserId());
    }
}
