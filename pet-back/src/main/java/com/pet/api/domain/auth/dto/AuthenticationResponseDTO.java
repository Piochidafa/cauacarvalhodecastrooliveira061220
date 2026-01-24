package com.pet.api.domain.auth.dto;

public record AuthenticationResponseDTO(String accessToken, String refreshToken, Long expiresIn) {
}
