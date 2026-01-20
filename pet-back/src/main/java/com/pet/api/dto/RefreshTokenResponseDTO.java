package com.pet.api.dto;

public record RefreshTokenResponseDTO(String accessToken, Long expiresIn) {
}

