package com.pet.api.domain.artista.dto;

import com.pet.api.domain.artista.model.Artista;
import java.time.LocalDateTime;

public record ArtistaResponseDTO(
    Long id,
    String nome,
    String imageKey,
    String imageUrl,
    Integer quantidadeAlbuns,
    LocalDateTime created_at,
    LocalDateTime updated_at
) {
    public static ArtistaResponseDTO fromArtista(Artista artista) {
        return new ArtistaResponseDTO(
            artista.getId(),
            artista.getNome(),
            artista.getImageKey(),
            artista.getImageUrl(),
            artista.getQuantidadeAlbuns(),
            artista.getCreated_at(),
            artista.getUpdated_at()
        );
    }
}
