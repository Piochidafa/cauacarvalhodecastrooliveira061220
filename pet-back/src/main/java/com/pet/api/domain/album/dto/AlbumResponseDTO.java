package com.pet.api.domain.album.dto;

import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.albumcover.dto.AlbumCoverResponseDTO;
import com.pet.api.domain.regional.dto.RegionalResponseDTO;
import java.time.LocalDateTime;
import java.util.List;

public record AlbumResponseDTO(
    Long id,
    String nome,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    RegionalResponseDTO regional,
    List<AlbumCoverResponseDTO> capas
) {
    public static AlbumResponseDTO fromAlbum(Album album, List<AlbumCoverResponseDTO> capas) {
        return new AlbumResponseDTO(
            album.getId(),
            album.getNome(),
            album.getCreatedAt(),
            album.getUpdatedAt(),
            RegionalResponseDTO.fromRegional(album.getRegional()),
            capas
        );
    }
}
