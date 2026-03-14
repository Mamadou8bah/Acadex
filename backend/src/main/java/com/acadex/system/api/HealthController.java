package com.acadex.system.api;

import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
public class HealthController {

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of("service", "acadex-backend", "status", "UP", "timestamp", OffsetDateTime.now());
    }
}
