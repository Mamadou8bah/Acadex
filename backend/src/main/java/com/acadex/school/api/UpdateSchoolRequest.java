package com.acadex.school.api;

import com.acadex.feature.model.FeatureFlag;
import com.acadex.school.model.SchoolStatus;
import com.acadex.school.model.SubscriptionPlan;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record UpdateSchoolRequest(
        @NotBlank String name,
        @NotBlank String slug,
        @Email @NotBlank String contactEmail,
        SubscriptionPlan subscriptionPlan,
        SchoolStatus status,
        Set<FeatureFlag> enabledFeatures
) {
}
