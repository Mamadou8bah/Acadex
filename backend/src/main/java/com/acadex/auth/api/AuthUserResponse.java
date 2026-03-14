package com.acadex.auth.api;

import com.acadex.user.model.PlatformRole;
import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        UUID tenantId,
        String email,
        String firstName,
        String lastName,
        PlatformRole role,
        boolean emailVerified
) {
}
