package com.acadex.tenant;

import com.acadex.school.repository.SchoolRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE - 10)
public class SubdomainTenantFilter extends OncePerRequestFilter {

    private final SchoolRepository schoolRepository;

    public SubdomainTenantFilter(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (TenantContext.getTenantId().isEmpty()) {
            String host = request.getHeader("Host");
            if (host != null && host.contains(".")) {
                String hostname = host.split(":")[0];
                String[] parts = hostname.split("\\.");
                if (parts.length >= 3 && !"www".equalsIgnoreCase(parts[0])) {
                    schoolRepository.findBySlug(parts[0]).ifPresent(school -> TenantContext.setTenantId(school.getId()));
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
