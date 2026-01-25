package com.pet.api.domain.album.stomp;

import com.pet.api.domain.album.dto.AlbumDTO;
import com.pet.api.domain.album.dto.AlbumWithCoverDTO;
import com.pet.api.domain.album.dto.AlbumCompleteResponseDTO;
import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.service.AlbumService;
import com.pet.api.domain.albumcover.dto.AlbumCoverResponseDTO;
import com.pet.api.domain.albumcover.service.AlbumCoverService;
import com.pet.api.shared.service.MinioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;

import java.util.stream.Collectors;

@Controller
public class AlbumStompController {

    private static final Logger logger = LoggerFactory.getLogger(AlbumStompController.class);

    @Autowired
    private AlbumService albumService;

    @Autowired
    private AlbumCoverService albumCoverService;

    @Autowired
    private MinioService minioService;

    /**
     * Cria um novo álbum com capa via STOMP
     * Cliente envia para: /app/album/create
     * Resposta publicada em: /topic/album/created
     */
    @MessageMapping("/album/create")
    @SendTo("/topic/album/created")
    public AlbumStompResponse createAlbum(AlbumWithCoverDTO albumWithCoverDTO) {
        try {
            logger.info("Criando álbum via STOMP: {}", albumWithCoverDTO.nome());
            logger.info("Upload de capa - fileName: {}, base64 chars: {}",
                albumWithCoverDTO.fileName(),
                albumWithCoverDTO.fileBase64() != null ? albumWithCoverDTO.fileBase64().length() : 0);
            
            // Criar álbum
            AlbumDTO albumDTO = new AlbumDTO(
                albumWithCoverDTO.nome(),
                albumWithCoverDTO.artistaId(),
                albumWithCoverDTO.regionalId()
            );
            Album album = albumService.createAlbum(albumDTO);

            // Se houver imagem, fazer upload
            if (albumWithCoverDTO.fileBase64() != null && !albumWithCoverDTO.fileBase64().isEmpty()) {
                try {
                    byte[] decodedBytes = java.util.Base64.getDecoder().decode(albumWithCoverDTO.fileBase64());
                    String objectKey = minioService.uploadFileFromBytes(decodedBytes, albumWithCoverDTO.fileName());
                    albumCoverService.createAlbumCoverWithKey(album.getId(), objectKey);
                    logger.info("Capa enviada com sucesso para o álbum {}", album.getId());
                } catch (Exception e) {
                    logger.error("Erro ao fazer upload da capa", e);
                    // Continua mesmo com erro na capa
                }
            }

            // Recarregar álbum para pegar capas
            album = albumService.getById(album.getId());
            
            // Converter capas para DTO
            var capasDTO = album.getCapas().stream()
                .map(cover -> AlbumCoverResponseDTO.fromAlbumCover(
                    cover,
                    minioService.getFileUrl(cover.getObjectKey())
                ))
                .collect(Collectors.toList());
            
            var albumDTO_response = AlbumCompleteResponseDTO.fromAlbum(album, capasDTO);

            return new AlbumStompResponse(
                "CREATE_SUCCESS",
                "Álbum criado com sucesso",
                albumDTO_response
            );
        } catch (Exception e) {
            logger.error("Erro ao criar álbum", e);
            return new AlbumStompResponse(
                "ERROR",
                "Erro ao criar álbum: " + e.getMessage(),
                null
            );
        }
    }

    /**
     * Atualiza um álbum com capa via STOMP
     * Cliente envia para: /app/album/update/{id}
     * Resposta publicada em: /topic/album/updated
     */
    @MessageMapping("/album/update/{id}")
    @SendTo("/topic/album/updated")
    public AlbumStompResponse updateAlbum(
            @DestinationVariable Long id,
            AlbumWithCoverDTO albumWithCoverDTO) {
        try {
            logger.info("Atualizando álbum {} via STOMP", id);
            logger.info("Upload de capa - fileName: {}, base64 chars: {}",
                albumWithCoverDTO.fileName(),
                albumWithCoverDTO.fileBase64() != null ? albumWithCoverDTO.fileBase64().length() : 0);
            
            // Atualizar álbum
            AlbumDTO albumDTO = new AlbumDTO(
                albumWithCoverDTO.nome(),
                albumWithCoverDTO.artistaId(),
                albumWithCoverDTO.regionalId()
            );
            Album album = albumService.updateAlbum(id, albumDTO);

            // Se houver imagem, fazer upload
            if (albumWithCoverDTO.fileBase64() != null && !albumWithCoverDTO.fileBase64().isEmpty()) {
                try {
                    byte[] decodedBytes = java.util.Base64.getDecoder().decode(albumWithCoverDTO.fileBase64());
                    String objectKey = minioService.uploadFileFromBytes(decodedBytes, albumWithCoverDTO.fileName());
                    albumCoverService.createAlbumCoverWithKey(album.getId(), objectKey);
                    logger.info("Capa enviada com sucesso para o álbum {}", album.getId());
                } catch (Exception e) {
                    logger.error("Erro ao fazer upload da capa", e);
                    // Continua mesmo com erro na capa
                }
            }

            // Recarregar álbum para pegar capas
            album = albumService.getById(album.getId());
            
            // Converter capas para DTO
            var capasDTO = album.getCapas().stream()
                .map(cover -> AlbumCoverResponseDTO.fromAlbumCover(
                    cover,
                    minioService.getFileUrl(cover.getObjectKey())
                ))
                .collect(Collectors.toList());
            
            var albumDTO_response = AlbumCompleteResponseDTO.fromAlbum(album, capasDTO);

            return new AlbumStompResponse(
                "UPDATE_SUCCESS",
                "Álbum atualizado com sucesso",
                albumDTO_response
            );
        } catch (Exception e) {
            logger.error("Erro ao atualizar álbum", e);
            return new AlbumStompResponse(
                "ERROR",
                "Erro ao atualizar álbum: " + e.getMessage(),
                null
            );
        }
    }

    /**
     * Obtém um álbum via STOMP
     * Cliente envia para: /app/album/get/{id}
     * Resposta publicada em: /topic/album/details
     */
    @MessageMapping("/album/get/{id}")
    @SendTo("/topic/album/details")
    public AlbumStompResponse getAlbum(@DestinationVariable Long id) {
        try {
            logger.info("Obtendo álbum {} via STOMP", id);
            Album album = albumService.getById(id);
            
            // Converter capas para DTO
            var capasDTO = album.getCapas().stream()
                .map(cover -> AlbumCoverResponseDTO.fromAlbumCover(
                    cover,
                    minioService.getFileUrl(cover.getObjectKey())
                ))
                .collect(Collectors.toList());
            
            var albumDTO_response = AlbumCompleteResponseDTO.fromAlbum(album, capasDTO);

            return new AlbumStompResponse(
                "GET_SUCCESS",
                "Álbum obtido com sucesso",
                albumDTO_response
            );
        } catch (Exception e) {
            logger.error("Erro ao obter álbum", e);
            return new AlbumStompResponse(
                "ERROR",
                "Erro ao obter álbum: " + e.getMessage(),
                null
            );
        }
    }
}
