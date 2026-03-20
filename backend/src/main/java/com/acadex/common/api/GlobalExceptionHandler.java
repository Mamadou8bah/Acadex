package com.acadex.common.api;

import java.time.OffsetDateTime;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Map<String, Object> handleBadCredentials(BadCredentialsException ex) {
        LOGGER.warn("Authentication failure", ex);
        return Map.of(
                "timestamp", OffsetDateTime.now(),
                "status", HttpStatus.UNAUTHORIZED.value(),
                "message", ex.getMessage()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidation(MethodArgumentNotValidException ex) {
        LOGGER.warn("Validation failure", ex);
        return Map.of(
                "timestamp", OffsetDateTime.now(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "message", "Validation failed"
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleIllegalArgument(IllegalArgumentException ex) {
        LOGGER.warn("Bad request", ex);
        return Map.of(
                "timestamp", OffsetDateTime.now(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "message", ex.getMessage()
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Map<String, Object> handleIllegalState(IllegalStateException ex) {
        LOGGER.error("Service dependency unavailable", ex);
        return Map.of(
                "timestamp", OffsetDateTime.now(),
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "message", ex.getMessage()
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Map<String, Object> handleAccessDenied(AccessDeniedException ex) {
        LOGGER.warn("Access denied", ex);
        return Map.of(
                "timestamp", OffsetDateTime.now(),
                "status", HttpStatus.FORBIDDEN.value(),
                "message", ex.getMessage()
        );
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> handleGeneric(Exception ex) {
        LOGGER.error("Unhandled application error", ex);
        return Map.of(
                "timestamp", OffsetDateTime.now(),
                "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "message", "Unexpected server error"
        );
    }
}
