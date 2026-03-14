package com.acadex.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI acadexOpenApi() {
        return new OpenAPI().info(new Info().title("Acadex API").version("v1").description("Multi-tenant school SaaS API"));
    }
}
