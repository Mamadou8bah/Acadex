package com.acadex.school.api;

import com.acadex.school.model.SubscriptionPlan;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SchoolRequest(
        @NotBlank String name,
        @NotBlank String slug,
        @Email @NotBlank String contactEmail,
        SubscriptionPlan subscriptionPlan
) {
}
