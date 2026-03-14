package com.acadex.email.service;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ResendEmailService implements EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ResendEmailService.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String fromEmail;

    public ResendEmailService(
            RestClient.Builder builder,
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:onboarding@acadex.dev}") String fromEmail
    ) {
        this.restClient = builder.baseUrl("https://api.resend.com").build();
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendEmail(String to, String subject, String html) {
        if (apiKey == null || apiKey.isBlank()) {
            LOGGER.info("Resend not configured. Skipping email to {}", to);
            return;
        }

        restClient.post()
                .uri("/emails")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "from", fromEmail,
                        "to", new String[]{to},
                        "subject", subject,
                        "html", html
                ))
                .retrieve()
                .toBodilessEntity();
    }
}
