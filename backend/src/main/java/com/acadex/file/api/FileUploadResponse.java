package com.acadex.file.api;

public record FileUploadResponse(
        String provider,
        String bucket,
        String fileName,
        String contentType,
        long size,
        String fileKey,
        String url
) {
}
