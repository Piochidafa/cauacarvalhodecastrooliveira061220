package com.pet.api.domain.album.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet.api.domain.album.dto.AlbumDTO;
import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.service.AlbumService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class AlbumWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(AlbumWebSocketHandler.class);

    @Autowired
    private AlbumService albumService;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("Conexão WebSocket estabelecida: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String payload = message.getPayload();
            WebSocketRequest request = objectMapper.readValue(payload, WebSocketRequest.class);

            switch (request.getAction()) {
                case "CREATE":
                    handleCreateAlbum(session, request);
                    break;
                case "UPDATE":
                    handleUpdateAlbum(session, request);
                    break;
                default:
                    sendError(session, "Ação desconhecida: " + request.getAction());
            }
        } catch (Exception e) {
            logger.error("Erro ao processar mensagem WebSocket", e);
            sendError(session, "Erro ao processar a mensagem: " + e.getMessage());
        }
    }

    private void handleCreateAlbum(WebSocketSession session, WebSocketRequest request) throws Exception {
        try {
            AlbumDTO albumDTO = objectMapper.convertValue(request.getData(), AlbumDTO.class);
            Album album = albumService.createAlbum(albumDTO);

            WebSocketResponse response = new WebSocketResponse();
            response.setAction("CREATE_SUCCESS");
            response.setMessage("Álbum criado com sucesso");
            response.setData(album);

            sendMessage(session, response);
        } catch (Exception e) {
            logger.error("Erro ao criar álbum", e);
            sendError(session, "Erro ao criar álbum: " + e.getMessage());
        }
    }

    private void handleUpdateAlbum(WebSocketSession session, WebSocketRequest request) throws Exception {
        try {
            Long albumId = ((Number) request.getData().get("id")).longValue();
            AlbumDTO albumDTO = objectMapper.convertValue(request.getData(), AlbumDTO.class);
            Album album = albumService.updateAlbum(albumId, albumDTO);

            WebSocketResponse response = new WebSocketResponse();
            response.setAction("UPDATE_SUCCESS");
            response.setMessage("Álbum atualizado com sucesso");
            response.setData(album);

            sendMessage(session, response);
        } catch (Exception e) {
            logger.error("Erro ao atualizar álbum", e);
            sendError(session, "Erro ao atualizar álbum: " + e.getMessage());
        }
    }

    private void sendMessage(WebSocketSession session, WebSocketResponse response) throws Exception {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        }
    }

    private void sendError(WebSocketSession session, String errorMessage) throws Exception {
        WebSocketResponse response = new WebSocketResponse();
        response.setAction("ERROR");
        response.setMessage(errorMessage);
        sendMessage(session, response);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        logger.info("Conexão WebSocket fechada: {} - Status: {}", session.getId(), status);
    }
}
