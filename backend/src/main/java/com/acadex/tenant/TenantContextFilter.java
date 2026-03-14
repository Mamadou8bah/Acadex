package com.acadex.tenant;

import com.acadex.auth.security.AcadexUserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantContextFilter extends OncePerRequestFilter {

    public static final String TENANT_HEADER = "X-Tenant-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String tenantId = request.getHeader(TENANT_HEADER);
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.getPrincipal() instanceof AcadexUserPrincipal principal) {
                UUID principalTenantId = principal.getTenantId();

                if (StringUtils.hasText(tenantId) && !principalTenantId.equals(UUID.fromString(tenantId))) {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Tenant isolation violation");
                    return;
                }

                TenantContext.setTenantId(principalTenantId);
            } else if (TenantContext.getTenantId().isEmpty() && StringUtils.hasText(tenantId)) {
                TenantContext.setTenantId(UUID.fromString(tenantId));
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
