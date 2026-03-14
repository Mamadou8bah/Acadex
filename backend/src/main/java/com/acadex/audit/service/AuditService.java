package com.acadex.audit.service;

import com.acadex.audit.model.AuditLog;
import jakarta.persistence.EntityManager;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final EntityManager entityManager;

    public AuditService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional
    public void log(UUID tenantId, UUID actorId, String action, String entityType, String entityId, String metadata) {
        AuditLog auditLog = new AuditLog();
        auditLog.setTenantId(tenantId);
        auditLog.setActorId(actorId);
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setMetadata(metadata);
        entityManager.persist(auditLog);
    }
}
