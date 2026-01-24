package com.pet.api.domain.albumcover.dto;

import com.pet.api.domain.albumcover.model.AlbumCover;
import java.time.LocalDateTime;

public record AlbumCoverResponseDTO(
    Long id,
    Long albumId,
    String objectKey,
    String url,
    LocalDateTime createdAt
) {
    public static AlbumCoverResponseDTO fromAlbumCover(AlbumCover albumCover, String url) {
        return new AlbumCoverResponseDTO(
            albumCover.getId(),
            albumCover.getAlbum() != null ? albumCover.getAlbum().getId() : null,
            albumCover.getObjectKey(),
            url,
            albumCover.getCreatedAt()
        );
    }
}
