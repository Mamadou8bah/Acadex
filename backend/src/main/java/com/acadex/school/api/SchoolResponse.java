package com.acadex.school.api;

import com.acadex.feature.model.FeatureFlag;
import com.acadex.school.model.SchoolStatus;
import com.acadex.school.model.SubscriptionPlan;
import java.util.Set;
import java.util.UUID;

public record SchoolResponse(
        UUID id,
        String name,
        String slug,
        String contactEmail,
        SubscriptionPlan subscriptionPlan,
        SchoolStatus status,
        Set<FeatureFlag> enabledFeatures
) {
}
