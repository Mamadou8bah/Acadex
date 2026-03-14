package com.acadex.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;

@Configuration
@EnableCaching
@EnableScheduling
@EnableRabbit
public class AppRuntimeConfig {
}
