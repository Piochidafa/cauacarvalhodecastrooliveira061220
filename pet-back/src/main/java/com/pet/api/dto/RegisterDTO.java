package com.pet.api.dto;

import com.pet.api.model.enums.UserRole;

public record RegisterDTO(String username, String password, UserRole role) {
}
