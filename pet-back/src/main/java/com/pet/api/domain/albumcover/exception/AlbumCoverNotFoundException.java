package com.pet.api.domain.albumcover.exception;

import com.pet.api.shared.exception.ResourceNotFoundException;

public class AlbumCoverNotFoundException extends ResourceNotFoundException {
    public AlbumCoverNotFoundException(String message) {
        super(message);
    }
}
