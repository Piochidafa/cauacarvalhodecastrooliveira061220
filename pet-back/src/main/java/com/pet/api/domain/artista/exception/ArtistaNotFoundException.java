package com.pet.api.domain.artista.exception;

import com.pet.api.shared.exception.ResourceNotFoundException;

public class ArtistaNotFoundException extends ResourceNotFoundException {
    public ArtistaNotFoundException(String message) {
        super(message);
    }
}
