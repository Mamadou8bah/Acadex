package com.acadex.file.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileValidationService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    public void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds maximum allowed size");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("application/pdf")
                || contentType.equals("text/csv")
                || contentType.equals("image/png")
                || contentType.equals("image/jpeg"))) {
            throw new IllegalArgumentException("Unsupported file type");
        }
    }
}
