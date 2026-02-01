package com.pet.api.shared.service;

import io.minio.*;
import io.minio.errors.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class MinioService {

    private static final Logger logger = LoggerFactory.getLogger(MinioService.class);

    @Autowired
    private MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.public-endpoint:${minio.endpoint}}")
    private String publicEndpoint;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeBucket() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );

            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build()
                );
                logger.info("Bucket '{}' criado com sucesso", bucketName);
            } else {
                logger.info("Bucket '{}' já existe", bucketName);
            }
        } catch (Exception e) {
            logger.error("Erro ao inicializar bucket: {}", e.getMessage(), e);
        }
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            logger.info("Arquivo '{}' enviado com sucesso", fileName);
            return fileName;
        } catch (Exception e) {
            logger.error("Erro ao fazer upload do arquivo: {}", e.getMessage(), e);
            throw new IOException("Erro ao fazer upload do arquivo: " + e.getMessage(), e);
        }
    }

    public String uploadFileFromBytes(byte[] bytes, String fileName) throws IOException {
        String objectKey = UUID.randomUUID().toString() + "_" + fileName;
        
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .stream(new java.io.ByteArrayInputStream(bytes), bytes.length, -1)
                            .contentType("image/*")
                            .build()
            );
            logger.info("Arquivo '{}' enviado com sucesso via bytes", objectKey);
            return objectKey;
        } catch (Exception e) {
            logger.error("Erro ao fazer upload do arquivo: {}", e.getMessage(), e);
            throw new IOException("Erro ao fazer upload do arquivo: " + e.getMessage(), e);
        }
    }

    public InputStream downloadFile(String objectKey) throws IOException {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            logger.error("Erro ao baixar arquivo: {}", e.getMessage(), e);
            throw new IOException("Erro ao baixar arquivo: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String objectKey) throws IOException {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build()
            );
            logger.info("Arquivo '{}' deletado com sucesso", objectKey);
        } catch (Exception e) {
            logger.error("Erro ao deletar arquivo: {}", e.getMessage(), e);
            throw new IOException("Erro ao deletar arquivo: " + e.getMessage(), e);
        }
    }

    public String getFileUrl(String objectKey) {
        try {
            MinioClient presignClient = getPresignClient();
            return presignClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .method(io.minio.http.Method.GET)
                            .expiry(30 * 60) // 30 minutos
                            .build()
            );
        } catch (Exception e) {
            logger.error("Erro ao gerar URL do arquivo: {}", e.getMessage(), e);
            return null;
        }
    }

    private MinioClient getPresignClient() {
        if (publicEndpoint == null || publicEndpoint.isBlank()) {
            return minioClient;
        }
        return MinioClient.builder()
                .endpoint(publicEndpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}
