package com.acadex.school.api;

import com.acadex.common.api.PageResponse;
import com.acadex.school.service.SchoolService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/platform/schools")
public class SchoolController {

    private final SchoolService schoolService;

    public SchoolController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public PageResponse<SchoolResponse> listSchools(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return schoolService.listSchools(page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SchoolResponse createSchool(@Valid @RequestBody SchoolRequest request) {
        return schoolService.createSchool(request);
    }

    @PutMapping("/{schoolId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public SchoolResponse updateSchool(@PathVariable UUID schoolId, @Valid @RequestBody UpdateSchoolRequest request) {
        return schoolService.updateSchool(schoolId, request);
    }

    @GetMapping("/{schoolId}/usage")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public TenantUsageResponse usage(@PathVariable UUID schoolId) {
        return schoolService.usage(schoolId);
    }
}
