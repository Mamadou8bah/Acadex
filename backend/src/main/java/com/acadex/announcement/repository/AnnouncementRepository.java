package com.acadex.announcement.repository;

import com.acadex.announcement.model.Announcement;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
    List<Announcement> findAllByTenantIdOrderByPublishAtDesc(UUID tenantId);
    Page<Announcement> findAllByTenantIdOrderByPublishAtDesc(UUID tenantId, Pageable pageable);
}
