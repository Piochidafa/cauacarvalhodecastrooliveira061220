package com.pet.api.domain.album.config;

import com.pet.api.domain.album.websocket.AlbumWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class AlbumWebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private AlbumWebSocketHandler albumWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Use a dedicated raw WebSocket endpoint to avoid clashing with STOMP /ws/album
        registry.addHandler(albumWebSocketHandler, "/ws/album/raw")
            .setAllowedOriginPatterns("http://localhost:5173", "http://localhost:8083");
    }
}
