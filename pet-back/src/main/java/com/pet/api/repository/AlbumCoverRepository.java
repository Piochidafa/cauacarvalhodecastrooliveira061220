package com.pet.api.repository;

import com.pet.api.model.AlbumCover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumCoverRepository extends JpaRepository<AlbumCover, Long> {
    List<AlbumCover> findByAlbum_Id(Long albumId);
}
