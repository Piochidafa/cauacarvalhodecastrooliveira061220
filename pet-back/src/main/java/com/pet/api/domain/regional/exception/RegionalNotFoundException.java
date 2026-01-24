package com.pet.api.domain.regional.exception;

import com.pet.api.shared.exception.ResourceNotFoundException;

public class RegionalNotFoundException extends ResourceNotFoundException {
    public RegionalNotFoundException(String message) {
        super(message);
    }
}
