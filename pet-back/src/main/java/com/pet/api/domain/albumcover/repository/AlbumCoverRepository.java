package com.pet.api.domain.albumcover.repository;

import com.pet.api.domain.albumcover.model.AlbumCover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumCoverRepository extends JpaRepository<AlbumCover, Long> {
    List<AlbumCover> findByAlbum_Id(Long albumId);

    void deleteByAlbum_Id(Long albumId);
}
