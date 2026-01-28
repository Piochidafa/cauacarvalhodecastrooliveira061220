package com.pet.api.domain.artista.dto;

import com.pet.api.domain.artista.model.Artista;
import com.pet.api.domain.album.dto.AlbumResponseDTO;
import java.time.LocalDateTime;
import java.util.List;

public record ArtistaDetailResponseDTO(
    Long id,
    String nome,
    String imageKey,
    String imageUrl,
    Integer quantidadeAlbuns,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<AlbumResponseDTO> albuns
) {
    public static ArtistaDetailResponseDTO fromArtista(Artista artista, List<AlbumResponseDTO> albuns) {
        return new ArtistaDetailResponseDTO(
            artista.getId(),
            artista.getNome(),
            artista.getImageKey(),
            artista.getImageUrl(),
            artista.getQuantidadeAlbuns(),
            artista.getCreated_at(),
            artista.getUpdated_at(),
            albuns
        );
    }
}
