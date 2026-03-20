package com.acadex.file.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
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
public class UploadThingStorageService {

    private static final String PREPARE_UPLOAD_URL = "https://api.uploadthing.com/v7/prepareUpload";

    private final StorageProperties storageProperties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public UploadThingStorageService(StorageProperties storageProperties, ObjectMapper objectMapper) {
        this.storageProperties = storageProperties;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.create();
    }

    public StoredFileResult uploadFile(MultipartFile file, String bucket, String tenantKey) {
        UploadThingConfig config = resolveConfig();
        String normalizedBucket = normalizeBucket(bucket);
        String uploadedName = buildUploadedName(file.getOriginalFilename(), tenantKey, normalizedBucket);

        Map<String, Object> prepareRequest = Map.of(
                "fileName", uploadedName,
                "fileSize", file.getSize(),
                "fileType", defaultString(file.getContentType(), MediaType.APPLICATION_OCTET_STREAM_VALUE),
                "acl", "public-read",
                "contentDisposition", "attachment"
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> prepareResponse = restClient.post()
                .uri(PREPARE_UPLOAD_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Uploadthing-Api-Key", config.apiKey())
                .body(prepareRequest)
                .retrieve()
                .body(Map.class);

        String uploadUrl = extractUploadUrl(prepareResponse);
        if (!StringUtils.hasText(uploadUrl)) {
            throw new IllegalStateException("UploadThing did not return a presigned upload URL");
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new NamedByteArrayResource(readBytes(file), uploadedName));

        restClient.put()
                .uri(uploadUrl)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .toBodilessEntity();

        String fileKey = extractFileKey(uploadUrl);
        return new StoredFileResult(
                "UPLOADTHING",
                normalizedBucket,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                fileKey,
                "https://" + config.appId() + ".ufs.sh/f/" + fileKey
        );
    }

    private UploadThingConfig resolveConfig() {
        StorageProperties.UploadThing uploadThing = storageProperties.getUploadthing();
        String apiKey = uploadThing.getApiKey();
        String appId = uploadThing.getAppId();
        String region = uploadThing.getRegion();

        if (StringUtils.hasText(uploadThing.getToken())) {
            try {
                String decoded = new String(Base64.getDecoder().decode(uploadThing.getToken()), StandardCharsets.UTF_8);
                Map<String, Object> tokenData = objectMapper.readValue(decoded, new TypeReference<>() {
                });
                apiKey = firstNonBlank(apiKey, stringValue(tokenData.get("apiKey")));
                appId = firstNonBlank(appId, stringValue(tokenData.get("appId")));
                region = firstNonBlank(region, stringValue(tokenData.get("region")));
            } catch (IllegalArgumentException | IOException ex) {
                throw new IllegalStateException("UploadThing token could not be decoded", ex);
            }
        }

        if (!StringUtils.hasText(apiKey) || !StringUtils.hasText(appId)) {
            throw new IllegalStateException("UploadThing file upload is not configured");
        }

        return new UploadThingConfig(appId, apiKey, firstNonBlank(region, "sea1"));
    }

    private String extractUploadUrl(Map<String, Object> response) {
        if (response == null || response.isEmpty()) {
            return null;
        }

        Object directUrl = response.get("url");
        if (directUrl != null) {
            return String.valueOf(directUrl);
        }

        Object data = response.get("data");
        if (data instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map<?, ?> first) {
            Object nestedUrl = first.get("url");
            if (nestedUrl != null) {
                return String.valueOf(nestedUrl);
            }
        }

        return null;
    }

    private String extractFileKey(String uploadUrl) {
        String withoutQuery = uploadUrl.split("\\?", 2)[0];
        int slashIndex = withoutQuery.lastIndexOf('/');
        if (slashIndex < 0 || slashIndex == withoutQuery.length() - 1) {
            throw new IllegalStateException("UploadThing upload URL did not contain a file key");
        }
        return withoutQuery.substring(slashIndex + 1);
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read uploaded file", ex);
        }
    }

    private String normalizeBucket(String bucket) {
        if (!StringUtils.hasText(bucket)) {
            return "general";
        }
        return bucket.trim().toLowerCase().replaceAll("[^a-z0-9/_-]+", "-");
    }

    private String buildUploadedName(String originalFilename, String tenantKey, String bucket) {
        String safeName = StringUtils.hasText(originalFilename) ? originalFilename : "file";
        String normalized = safeName.toLowerCase().replaceAll("[^a-z0-9._-]+", "-").replaceAll("-{2,}", "-");
        return tenantKey + "-" + bucket.replace('/', '-') + "-" + UUID.randomUUID() + "-" + normalized;
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String defaultString(String value, String defaultValue) {
        return StringUtils.hasText(value) ? value : defaultValue;
    }

    private String firstNonBlank(String first, String second) {
        return StringUtils.hasText(first) ? first : second;
    }

    private record UploadThingConfig(String appId, String apiKey, String region) {
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
