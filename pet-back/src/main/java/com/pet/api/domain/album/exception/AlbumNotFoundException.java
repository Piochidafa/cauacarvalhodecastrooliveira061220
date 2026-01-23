package com.pet.api.domain.album.exception;

import com.pet.api.shared.exception.ResourceNotFoundException;

public class AlbumNotFoundException extends ResourceNotFoundException {
    public AlbumNotFoundException(String message) {
        super(message);
    }
}
