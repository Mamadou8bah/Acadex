package com.acadex.file.service;

public record StoredFileResult(
        String provider,
        String bucket,
        String fileName,
        String contentType,
        long size,
        String fileKey,
        String url
) {
}
