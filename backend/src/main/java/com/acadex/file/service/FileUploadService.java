package com.acadex.file.service;

import com.acadex.tenant.TenantContext;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileUploadService {

    private final FileValidationService fileValidationService;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final UploadThingStorageService uploadThingStorageService;

    public FileUploadService(
            FileValidationService fileValidationService,
            CloudinaryStorageService cloudinaryStorageService,
            UploadThingStorageService uploadThingStorageService
    ) {
        this.fileValidationService = fileValidationService;
        this.cloudinaryStorageService = cloudinaryStorageService;
        this.uploadThingStorageService = uploadThingStorageService;
    }

    public StoredFileResult upload(MultipartFile file, String bucket) {
        if (fileValidationService.isImage(file)) {
            fileValidationService.validateImage(file);
            return cloudinaryStorageService.uploadImage(file, bucket, tenantKey());
        }

        fileValidationService.validateDocument(file);
        return uploadThingStorageService.uploadFile(file, bucket, tenantKey());
    }

    public List<StoredFileResult> uploadAll(List<MultipartFile> files, String bucket) {
        return files.stream().map(file -> upload(file, bucket)).toList();
    }

    private String tenantKey() {
        return TenantContext.getTenantId().map(Object::toString).orElse("platform");
    }
}
