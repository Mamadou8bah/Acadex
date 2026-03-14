package com.acadex.file.api;

public record FileValidationResponse(String message, long size, String contentType) {
}
