package com.acadex.file.api;

import com.acadex.file.service.FileUploadService;
import com.acadex.file.service.FileValidationService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileValidationService fileValidationService;
    private final FileUploadService fileUploadService;

    public FileController(FileValidationService fileValidationService, FileUploadService fileUploadService) {
        this.fileValidationService = fileValidationService;
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/validate")
    @ResponseStatus(HttpStatus.OK)
    public FileValidationResponse validateFile(@RequestParam("file") MultipartFile file) {
        fileValidationService.validate(file);
        return new FileValidationResponse("File is valid", file.getSize(), file.getContentType());
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public FileUploadResponse uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "bucket", defaultValue = "general") String bucket
    ) {
        var stored = fileUploadService.upload(file, bucket);
        return new FileUploadResponse(
                stored.provider(),
                stored.bucket(),
                stored.fileName(),
                stored.contentType(),
                stored.size(),
                stored.fileKey(),
                stored.url()
        );
    }

    @PostMapping(value = "/upload/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public List<FileUploadResponse> uploadFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "bucket", defaultValue = "general") String bucket
    ) {
        return fileUploadService.uploadAll(files, bucket).stream()
                .map(stored -> new FileUploadResponse(
                        stored.provider(),
                        stored.bucket(),
                        stored.fileName(),
                        stored.contentType(),
                        stored.size(),
                        stored.fileKey(),
                        stored.url()
                ))
                .toList();
    }
}
