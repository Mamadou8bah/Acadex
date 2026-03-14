package com.acadex.user.api;

import com.acadex.user.model.PlatformRole;
import java.util.UUID;

public record UserResponse(
        UUID id,
        UUID tenantId,
        String email,
        String firstName,
        String lastName,
        PlatformRole role,
        boolean active,
        boolean emailVerified
) {
}
