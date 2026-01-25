package com.pet.api.domain.album.dto;

import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.albumcover.dto.AlbumCoverResponseDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record AlbumCompleteResponseDTO(
    Long id,
    String nome,
    Long artistaId,
    String artistaNome,
    Long regionalId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<AlbumCoverResponseDTO> capas
) {
    public static AlbumCompleteResponseDTO fromAlbum(Album album, List<AlbumCoverResponseDTO> capas) {
        return new AlbumCompleteResponseDTO(
            album.getId(),
            album.getNome(),
            album.getArtista() != null ? album.getArtista().getId() : null,
            album.getArtista() != null ? album.getArtista().getNome() : null,
            album.getRegional() != null ? album.getRegional().getId() : null,
            album.getCreatedAt(),
            album.getUpdatedAt(),
            capas
        );
    }
}
