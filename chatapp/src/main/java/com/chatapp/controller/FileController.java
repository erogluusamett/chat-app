package com.chatapp.controller;

import com.chatapp.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/download/{subDir}/{fileName}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable String subDir,
            @PathVariable String fileName) {
        try {
            byte[] fileData = fileStorageService.loadFile(subDir, fileName);

            // Content-Type'ı dosya adından belirle
            MediaType mediaType = determineMediaType(fileName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentLength(fileData.length);

            // İndir veya inline göster
            if (mediaType.getType().equals("image")) {
                headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"");
            } else {
                headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");
            }

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileData);

        } catch (Exception e) {
            log.error("Dosya indirilemedi: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    private MediaType determineMediaType(String fileName) {
        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        } else if (lowerName.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        } else if (lowerName.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        } else if (lowerName.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        } else {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}