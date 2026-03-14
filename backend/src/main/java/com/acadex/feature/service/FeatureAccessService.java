package com.acadex.feature.service;

import com.acadex.feature.model.FeatureFlag;
import com.acadex.school.model.School;
import com.acadex.school.model.SubscriptionPlan;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class FeatureAccessService {

    private static final Map<SubscriptionPlan, Set<FeatureFlag>> PLAN_FEATURES = Map.of(
            SubscriptionPlan.STARTER, EnumSet.of(FeatureFlag.ENABLE_PARENT_PORTAL),
            SubscriptionPlan.GROWTH, EnumSet.of(
                    FeatureFlag.ENABLE_PARENT_PORTAL,
                    FeatureFlag.ENABLE_ANALYTICS,
                    FeatureFlag.ENABLE_ATTENDANCE_ALERTS
            ),
            SubscriptionPlan.ENTERPRISE, EnumSet.allOf(FeatureFlag.class)
    );

    public void validateEnabledFeatures(School school) {
        Set<FeatureFlag> allowed = PLAN_FEATURES.getOrDefault(school.getSubscriptionPlan(), EnumSet.noneOf(FeatureFlag.class));
        if (!allowed.containsAll(school.getEnabledFeatures())) {
            throw new AccessDeniedException("Selected features are not allowed by the subscription plan");
        }
    }

    public void requireFeature(School school, FeatureFlag featureFlag) {
        Set<FeatureFlag> allowed = PLAN_FEATURES.getOrDefault(school.getSubscriptionPlan(), EnumSet.noneOf(FeatureFlag.class));
        if (!allowed.contains(featureFlag) || !school.getEnabledFeatures().contains(featureFlag)) {
            throw new AccessDeniedException("Feature is not enabled for this tenant");
        }
    }
}
