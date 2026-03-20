package com.acadex.file.service;

import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileValidationService {

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final long MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
    private static final Set<String> IMAGE_TYPES = Set.of(
            "image/png",
            "image/jpeg",
            "image/webp"
    );
    private static final Set<String> DOCUMENT_TYPES = Set.of(
            "application/pdf",
            "text/csv",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    public void validate(MultipartFile file) {
        if (isImage(file)) {
            validateImage(file);
            return;
        }
        validateDocument(file);
    }

    public void validateImage(MultipartFile file) {
        validateNotEmpty(file);
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image exceeds maximum allowed size");
        }
        if (!IMAGE_TYPES.contains(normalizedContentType(file))) {
            throw new IllegalArgumentException("Unsupported image type");
        }
    }

    public void validateDocument(MultipartFile file) {
        validateNotEmpty(file);
        if (file.getSize() > MAX_DOCUMENT_SIZE) {
            throw new IllegalArgumentException("File exceeds maximum allowed size");
        }
        String contentType = normalizedContentType(file);
        if (IMAGE_TYPES.contains(contentType)) {
            return;
        }
        if (!DOCUMENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported file type");
        }
    }

    public boolean isImage(MultipartFile file) {
        return IMAGE_TYPES.contains(normalizedContentType(file));
    }

    private void validateNotEmpty(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
    }

    private String normalizedContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType)) {
            throw new IllegalArgumentException("File content type is required");
        }
        return contentType.toLowerCase();
    }
}
