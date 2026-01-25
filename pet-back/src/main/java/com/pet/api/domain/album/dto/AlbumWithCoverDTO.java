package com.pet.api.domain.album.dto;

public record AlbumWithCoverDTO(
    String nome,
    Long artistaId,
    Long regionalId,
    String fileBase64,
    String fileName
) {
}
