package com.acadex.user.api;

import com.acadex.user.model.PlatformRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        PlatformRole role,
        boolean active
) {
}
