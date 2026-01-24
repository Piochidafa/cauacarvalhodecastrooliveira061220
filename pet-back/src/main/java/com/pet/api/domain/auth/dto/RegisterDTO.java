package com.pet.api.domain.auth.dto;

import com.pet.api.domain.auth.model.enums.UserRole;

public record RegisterDTO(String username, String password, UserRole role) {
}
