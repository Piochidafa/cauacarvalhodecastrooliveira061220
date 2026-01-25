package com.pet.api.domain.album.stomp;

import com.pet.api.domain.albumcover.model.AlbumCover;
import com.pet.api.domain.albumcover.service.AlbumCoverService;
import com.pet.api.shared.service.MinioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
public class AlbumCoverStompController {

    private static final Logger logger = LoggerFactory.getLogger(AlbumCoverStompController.class);

    @Autowired
    private AlbumCoverService albumCoverService;

    @Autowired
    private MinioService minioService;

    /**
     * Faz upload de capa de álbum via STOMP
     * Cliente envia para: /app/album/cover/upload/{albumId}
     * Resposta publicada em: /topic/album/cover/uploaded
     */
    @MessageMapping("/album/cover/upload/{albumId}")
    @SendTo("/topic/album/cover/uploaded")
    public AlbumStompResponse uploadCover(
            @DestinationVariable Long albumId,
            AlbumCoverUploadRequest request) {
        try {
            logger.info("Fazendo upload de capa para álbum {} via STOMP", albumId);
            
            // Decodificar base64 e criar arquivo
            byte[] decodedBytes = java.util.Base64.getDecoder().decode(request.fileBase64());
            
            // Salvar no MinIO
            String objectKey = minioService.uploadFileFromBytes(decodedBytes, request.fileName());
            
            // Criar registro no banco
            AlbumCover albumCover = new AlbumCover();
            albumCover.setObjectKey(objectKey);
            
            if(albumId != null) {
                albumCover = albumCoverService.createAlbumCoverWithKey(albumId, objectKey);
            }

            return new AlbumStompResponse(
                "COVER_UPLOAD_SUCCESS",
                "Capa enviada com sucesso",
                albumCover
            );
        } catch (Exception e) {
            logger.error("Erro ao fazer upload de capa", e);
            return new AlbumStompResponse(
                "COVER_UPLOAD_ERROR",
                "Erro ao enviar capa: " + e.getMessage(),
                null
            );
        }
    }

    public static class AlbumCoverUploadRequest {
        public String fileBase64;
        public String fileName;

        public AlbumCoverUploadRequest() {}

        public AlbumCoverUploadRequest(String fileBase64, String fileName) {
            this.fileBase64 = fileBase64;
            this.fileName = fileName;
        }

        public String fileBase64() {
            return fileBase64;
        }

        public String fileName() {
            return fileName;
        }
    }
}
