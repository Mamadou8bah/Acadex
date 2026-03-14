package com.acadex.auth.security;

import com.acadex.user.model.UserAccount;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessTokenMinutes;
    private final long refreshTokenDays;

    public JwtService(
            @Value("${security.jwt.secret:VGhpc0lzTm90QVNlY3JldEJ1dFN1ZmZpY2llbnRGb3JEZXZlbG9wbWVudDEyMzQ1Njc4OTA=}") String secret,
            @Value("${security.jwt.access-token-minutes:30}") long accessTokenMinutes,
            @Value("${security.jwt.refresh-token-days:14}") long refreshTokenDays
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessTokenMinutes = accessTokenMinutes;
        this.refreshTokenDays = refreshTokenDays;
    }

    public String generateAccessToken(UserAccount user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("uid", user.getId().toString())
                .claim("tenantId", user.getTenantId().toString())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTokenMinutes * 60)))
                .signWith(signingKey)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }

    public UUID getUserId(String token) {
        return UUID.fromString(parse(token).get("uid", String.class));
    }

    public UUID getTenantId(String token) {
        return UUID.fromString(parse(token).get("tenantId", String.class));
    }

    public String getUsername(String token) {
        return parse(token).getSubject();
    }

    public long getRefreshTokenDays() {
        return refreshTokenDays;
    }
}
