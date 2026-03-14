package com.acadex.auth.api;

import com.acadex.school.model.SubscriptionPlan;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterSchoolAdminRequest(
        @NotBlank String schoolName,
        @NotBlank String schoolSlug,
        @Email @NotBlank String schoolEmail,
        @NotBlank String adminFirstName,
        @NotBlank String adminLastName,
        @Email @NotBlank String adminEmail,
        @NotBlank @Size(min = 8) String password,
        SubscriptionPlan subscriptionPlan
) {
}
