package com.acadex.file.service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryStorageService {

    private final StorageProperties storageProperties;
    private final RestClient restClient;

    public CloudinaryStorageService(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        this.restClient = RestClient.create();
    }

    public StoredFileResult uploadImage(MultipartFile file, String bucket, String tenantKey) {
        StorageProperties.Cloudinary cloudinary = storageProperties.getCloudinary();
        if (!StringUtils.hasText(cloudinary.getCloudName())
                || !StringUtils.hasText(cloudinary.getApiKey())
                || !StringUtils.hasText(cloudinary.getApiSecret())) {
            throw new IllegalStateException("Cloudinary image upload is not configured");
        }

        String normalizedBucket = normalizeBucket(bucket);
        String folder = cloudinary.getFolder() + "/" + tenantKey + "/" + normalizedBucket;
        String publicId = buildFileStem(file.getOriginalFilename());

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new NamedByteArrayResource(readBytes(file), file.getOriginalFilename()));
        body.add("folder", folder);
        body.add("public_id", publicId);
        body.add("use_filename", "true");
        body.add("unique_filename", "true");
        body.add("overwrite", "false");

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.post()
                .uri("https://api.cloudinary.com/v1_1/{cloudName}/image/upload", cloudinary.getCloudName())
                .headers(headers -> headers.setBasicAuth(cloudinary.getApiKey(), cloudinary.getApiSecret()))
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException("Cloudinary did not return an upload response");
        }

        String secureUrl = stringValue(response.get("secure_url"));
        String assetId = stringValue(response.get("public_id"));
        if (!StringUtils.hasText(secureUrl) || !StringUtils.hasText(assetId)) {
            throw new IllegalStateException("Cloudinary upload response was missing required fields");
        }

        return new StoredFileResult(
                "CLOUDINARY",
                normalizedBucket,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                assetId,
                secureUrl
        );
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read uploaded image", ex);
        }
    }

    private String normalizeBucket(String bucket) {
        if (!StringUtils.hasText(bucket)) {
            return "general";
        }
        return bucket.trim().toLowerCase().replaceAll("[^a-z0-9/_-]+", "-");
    }

    private String buildFileStem(String originalFilename) {
        String candidate = StringUtils.hasText(originalFilename) ? originalFilename : UUID.randomUUID().toString();
        String stripped = candidate.replaceAll("\\.[^.]+$", "");
        String normalized = stripped.toLowerCase().replaceAll("[^a-z0-9_-]+", "-").replaceAll("-{2,}", "-");
        if (!StringUtils.hasText(normalized)) {
            normalized = "asset";
        }
        return normalized + "-" + UUID.randomUUID();
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static final class NamedByteArrayResource extends ByteArrayResource {

        private final String filename;

        private NamedByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = filename;
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }
}
