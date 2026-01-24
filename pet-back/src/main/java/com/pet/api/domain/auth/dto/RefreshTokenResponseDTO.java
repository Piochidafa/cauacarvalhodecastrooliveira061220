package com.pet.api.domain.auth.dto;

public record RefreshTokenResponseDTO(String accessToken, Long expiresIn) {
}
