package com.pet.api.dto;

import com.pet.api.model.UserRole;

public record RegisterDTO(String username, String password, UserRole role) {
}
