package com.pet.api.domain.artista.dto;

import com.pet.api.domain.album.dto.AlbumResponseDTO;
import com.pet.api.domain.artista.model.Artista;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;

public record ArtistaDetailPageResponseDTO(
    Long id,
    String nome,
    String imageKey,
    String imageUrl,
    Integer quantidadeAlbuns,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Page<AlbumResponseDTO> albuns
) {
    public static ArtistaDetailPageResponseDTO fromArtista(Artista artista, Page<AlbumResponseDTO> albuns) {
        return new ArtistaDetailPageResponseDTO(
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
