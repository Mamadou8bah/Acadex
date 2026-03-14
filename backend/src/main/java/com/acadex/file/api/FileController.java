package com.acadex.file.api;

import com.acadex.file.service.FileValidationService;
import org.springframework.http.HttpStatus;
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

    public FileController(FileValidationService fileValidationService) {
        this.fileValidationService = fileValidationService;
    }

    @PostMapping("/validate")
    @ResponseStatus(HttpStatus.OK)
    public FileValidationResponse validateFile(@RequestParam("file") MultipartFile file) {
        fileValidationService.validate(file);
        return new FileValidationResponse("File is valid", file.getSize(), file.getContentType());
    }
}
