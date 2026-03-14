package com.acadex.announcement.service;

import com.acadex.announcement.api.AnnouncementResponse;
import com.acadex.announcement.api.CreateAnnouncementRequest;
import com.acadex.announcement.model.Announcement;
import com.acadex.announcement.model.AnnouncementAudience;
import com.acadex.announcement.repository.AnnouncementRepository;
import com.acadex.audit.service.AuditService;
import com.acadex.common.api.PageResponse;
import com.acadex.notification.service.NotificationService;
import com.acadex.tenant.TenantAccessService;
import com.acadex.user.repository.UserAccountRepository;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final NotificationService notificationService;
    private final UserAccountRepository userAccountRepository;
    private final AuditService auditService;
    private final TenantAccessService tenantAccessService;

    public AnnouncementService(
            AnnouncementRepository announcementRepository,
            NotificationService notificationService,
            UserAccountRepository userAccountRepository,
            AuditService auditService,
            TenantAccessService tenantAccessService
    ) {
        this.announcementRepository = announcementRepository;
        this.notificationService = notificationService;
        this.userAccountRepository = userAccountRepository;
        this.auditService = auditService;
        this.tenantAccessService = tenantAccessService;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "tenant-announcements", key = "#page + '-' + #size + '-' + T(com.acadex.tenant.TenantContext).getTenantId().orElse(null)")
    public PageResponse<AnnouncementResponse> listAnnouncements(int page, int size) {
        UUID tenantId = tenantAccessService.requireTenant();
        Page<Announcement> announcements = announcementRepository.findAllByTenantIdOrderByPublishAtDesc(tenantId, PageRequest.of(page, size));
        return new PageResponse<>(
                announcements.getContent().stream().map(this::map).toList(),
                announcements.getNumber(),
                announcements.getSize(),
                announcements.getTotalElements(),
                announcements.getTotalPages()
        );
    }

    @Transactional
    @CacheEvict(value = {"tenant-announcements", "analytics-summary"}, allEntries = true)
    public AnnouncementResponse createAnnouncement(CreateAnnouncementRequest request, UUID authorId) {
        UUID tenantId = tenantAccessService.requireTenant();
        Announcement announcement = new Announcement();
        announcement.setTenantId(tenantId);
        announcement.setAuthorId(authorId);
        announcement.setTitle(request.title());
        announcement.setContent(request.content());
        announcement.setAudience(request.audience() == null ? AnnouncementAudience.SCHOOL_WIDE : request.audience());
        announcement.setPublishAt(request.publishAt() == null ? OffsetDateTime.now() : request.publishAt());
        announcement = announcementRepository.save(announcement);
        final Announcement savedAnnouncement = announcement;

        userAccountRepository.findAllByTenantId(tenantId).forEach(user ->
                notificationService.queueEmail(
                        tenantId,
                        user.getId(),
                        "New announcement: " + savedAnnouncement.getTitle(),
                        savedAnnouncement.getContent()
                )
        );
        auditService.log(tenantId, authorId, "ANNOUNCEMENT_CREATED", "Announcement", savedAnnouncement.getId().toString(), savedAnnouncement.getTitle());
        return map(savedAnnouncement);
    }

    private AnnouncementResponse map(Announcement announcement) {
        return new AnnouncementResponse(
                announcement.getId(),
                announcement.getTenantId(),
                announcement.getAuthorId(),
                announcement.getTitle(),
                announcement.getContent(),
                announcement.getAudience(),
                announcement.getPublishAt()
        );
    }
}
