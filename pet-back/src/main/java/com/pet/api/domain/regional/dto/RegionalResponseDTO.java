package com.pet.api.domain.regional.dto;

import com.pet.api.domain.regional.model.Regional;

public record RegionalResponseDTO(
    Long id,
    String nome,
    Boolean ativo
) {
    public static RegionalResponseDTO fromRegional(Regional regional) {
        if (regional == null) {
            return null;
        }

        return new RegionalResponseDTO(
            regional.getId(),
            regional.getNome(),
            regional.getAtivo()
        );
    }
}
