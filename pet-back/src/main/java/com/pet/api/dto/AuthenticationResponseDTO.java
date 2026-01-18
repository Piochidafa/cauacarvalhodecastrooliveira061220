package com.pet.api.dto;

public record AuthenticationResponseDTO(String accessToken, String refreshToken, Long expiresIn) {
}
