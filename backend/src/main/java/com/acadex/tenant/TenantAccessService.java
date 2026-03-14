package com.acadex.tenant;

import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class TenantAccessService {

    public UUID requireTenant() {
        return TenantContext.getTenantId().orElseThrow(() -> new AccessDeniedException("Tenant context missing"));
    }

    public void ensureMatches(UUID requestedTenantId) {
        UUID currentTenantId = requireTenant();
        if (!currentTenantId.equals(requestedTenantId)) {
            throw new AccessDeniedException("Tenant isolation violation");
        }
    }
}
