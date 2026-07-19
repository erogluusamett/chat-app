package com.chatapp.service;

import com.chatapp.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.max-size}")
    private long maxFileSize;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final List<String> ALLOWED_FILE_TYPES = Arrays.asList(
            "application/pdf", "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/zip"
    );

    public String storeFile(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Dosya boş olamaz");
        }

        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.");
        }

        String contentType = file.getContentType();
        boolean isImage = contentType != null && ALLOWED_IMAGE_TYPES.contains(contentType);
        boolean isAllowedFile = contentType != null && ALLOWED_FILE_TYPES.contains(contentType);

        if (!isImage && !isAllowedFile) {
            throw new BadRequestException("Bu dosya türü desteklenmiyor: " + contentType);
        }

        try {
            Path uploadPath = Paths.get(uploadDir, subDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = StringUtils.cleanPath(
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "file"
            );

            String extension = "";
            int dotIndex = originalFilename.lastIndexOf(".");
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex);
            }

            String uniqueFileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = uploadPath.resolve(uniqueFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/api/files/download/" + subDirectory + "/" + uniqueFileName;
            log.info("Dosya yüklendi: {}", fileUrl);

            return fileUrl;

        } catch (IOException ex) {
            throw new BadRequestException("Dosya yüklenemedi: " + ex.getMessage());
        }
    }

    public byte[] loadFile(String subDirectory, String fileName) {
        try {
            Path filePath = Paths.get(uploadDir, subDirectory, fileName);
            return Files.readAllBytes(filePath);
        } catch (IOException ex) {
            throw new BadRequestException("Dosya okunamadı: " + fileName);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null) return;

        try {
            String relativePath = fileUrl.replace("/api/files/download/", "");
            Path filePath = Paths.get(uploadDir, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Dosya silindi: {}", filePath);
            }
        } catch (IOException ex) {
            log.error("Dosya silinemedi: {}", ex.getMessage());
        }
    }
}