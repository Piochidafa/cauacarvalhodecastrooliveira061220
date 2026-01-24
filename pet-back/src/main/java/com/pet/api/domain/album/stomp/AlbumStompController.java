package com.pet.api.domain.album.stomp;

import com.pet.api.domain.album.dto.AlbumDTO;
import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.service.AlbumService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;

@Controller
public class AlbumStompController {

    private static final Logger logger = LoggerFactory.getLogger(AlbumStompController.class);

    @Autowired
    private AlbumService albumService;

    /**
     * Cria um novo álbum via STOMP
     * Cliente envia para: /app/album/create
     * Resposta publicada em: /topic/album/created
     */
    @MessageMapping("/album/create")
    @SendTo("/topic/album/created")
    public AlbumStompResponse createAlbum(AlbumDTO albumDTO) {
        try {
            logger.info("Criando álbum via STOMP: {}", albumDTO.nome());
            Album album = albumService.createAlbum(albumDTO);

            return new AlbumStompResponse(
                "CREATE_SUCCESS",
                "Álbum criado com sucesso",
                album
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
     * Atualiza um álbum via STOMP
     * Cliente envia para: /app/album/update/{id}
     * Resposta publicada em: /topic/album/updated
     */
    @MessageMapping("/album/update/{id}")
    @SendTo("/topic/album/updated")
    public AlbumStompResponse updateAlbum(
            @DestinationVariable Long id,
            AlbumDTO albumDTO) {
        try {
            logger.info("Atualizando álbum {} via STOMP", id);
            Album album = albumService.updateAlbum(id, albumDTO);

            return new AlbumStompResponse(
                "UPDATE_SUCCESS",
                "Álbum atualizado com sucesso",
                album
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

            return new AlbumStompResponse(
                "GET_SUCCESS",
                "Álbum obtido com sucesso",
                album
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
