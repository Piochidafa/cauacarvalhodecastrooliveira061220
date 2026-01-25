package com.pet.api.domain.album.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class AlbumStompConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/album")
            .setAllowedOriginPatterns("http://localhost:5173", "http://localhost:8083");

        registry.addEndpoint("/ws/album")
            .setAllowedOriginPatterns("http://localhost:5173", "http://localhost:8083")
            .withSockJS()
            .setStreamBytesLimit(20 * 1024 * 1024)
            .setHttpMessageCacheSize(20 * 1024 * 1024)
            .setDisconnectDelay(30 * 1000);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.setMessageSizeLimit(50 * 1024 * 1024);
        registry.setSendBufferSizeLimit(50 * 1024 * 1024);
        registry.setSendTimeLimit(30 * 1000);
    }
}
