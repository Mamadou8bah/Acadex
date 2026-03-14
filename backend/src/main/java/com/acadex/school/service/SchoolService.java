package com.acadex.school.service;

import com.acadex.announcement.repository.AnnouncementRepository;
import com.acadex.common.api.PageResponse;
import com.acadex.feature.service.FeatureAccessService;
import com.acadex.notification.repository.NotificationOutboxRepository;
import com.acadex.school.api.SchoolRequest;
import com.acadex.school.api.SchoolResponse;
import com.acadex.school.api.TenantUsageResponse;
import com.acadex.school.api.UpdateSchoolRequest;
import com.acadex.school.model.School;
import com.acadex.school.model.SubscriptionPlan;
import com.acadex.school.repository.SchoolRepository;
import com.acadex.user.repository.UserAccountRepository;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SchoolService {

    private final SchoolRepository schoolRepository;
    private final FeatureAccessService featureAccessService;
    private final UserAccountRepository userAccountRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationOutboxRepository notificationOutboxRepository;

    public SchoolService(
            SchoolRepository schoolRepository,
            FeatureAccessService featureAccessService,
            UserAccountRepository userAccountRepository,
            AnnouncementRepository announcementRepository,
            NotificationOutboxRepository notificationOutboxRepository
    ) {
        this.schoolRepository = schoolRepository;
        this.featureAccessService = featureAccessService;
        this.userAccountRepository = userAccountRepository;
        this.announcementRepository = announcementRepository;
        this.notificationOutboxRepository = notificationOutboxRepository;
    }

    @Transactional
    @CacheEvict(value = "platform-schools", allEntries = true)
    public SchoolResponse createSchool(SchoolRequest request) {
        School school = new School();
        school.setName(request.name());
        school.setSlug(request.slug());
        school.setContactEmail(request.contactEmail());
        school.setSubscriptionPlan(request.subscriptionPlan() == null ? SubscriptionPlan.STARTER : request.subscriptionPlan());
        featureAccessService.validateEnabledFeatures(school);
        return map(schoolRepository.save(school));
    }

    @Transactional
    @CacheEvict(value = {"platform-schools", "analytics-summary"}, allEntries = true)
    public SchoolResponse updateSchool(UUID schoolId, UpdateSchoolRequest request) {
        School school = schoolRepository.findById(schoolId).orElseThrow();
        school.setName(request.name());
        school.setSlug(request.slug());
        school.setContactEmail(request.contactEmail());
        if (request.subscriptionPlan() != null) {
            school.setSubscriptionPlan(request.subscriptionPlan());
        }
        if (request.status() != null) {
            school.setStatus(request.status());
        }
        if (request.enabledFeatures() != null) {
            school.setEnabledFeatures(request.enabledFeatures());
        }
        featureAccessService.validateEnabledFeatures(school);
        return map(school);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "platform-schools", key = "#page + '-' + #size")
    public PageResponse<SchoolResponse> listSchools(int page, int size) {
        Page<School> schools = schoolRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return new PageResponse<>(
                schools.getContent().stream().map(this::map).toList(),
                schools.getNumber(),
                schools.getSize(),
                schools.getTotalElements(),
                schools.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public TenantUsageResponse usage(UUID schoolId) {
        return new TenantUsageResponse(
                schoolId,
                userAccountRepository.countByTenantId(schoolId),
                announcementRepository.findAllByTenantIdOrderByPublishAtDesc(schoolId).size(),
                notificationOutboxRepository.countByTenantId(schoolId),
                0,
                0
        );
    }

    private SchoolResponse map(School school) {
        return new SchoolResponse(
                school.getId(),
                school.getName(),
                school.getSlug(),
                school.getContactEmail(),
                school.getSubscriptionPlan(),
                school.getStatus(),
                school.getEnabledFeatures()
        );
    }
}
