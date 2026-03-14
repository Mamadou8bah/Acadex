package com.acadex.auth.api;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        AuthUserResponse user
) {
}
