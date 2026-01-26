package com.pet.api.domain.album.repository;

import com.pet.api.domain.album.model.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
    
    Page<Album> findByArtista_Id(Long artistaId, Pageable pageable);

    Page<Album> findByNomeContainingIgnoreCaseAndArtista_Id(String nome, Long artistaId, Pageable pageable);
    
    @Query("SELECT a FROM Album a WHERE LOWER(a.artista.nome) LIKE LOWER(CONCAT('%', :nomeArtista, '%'))")
    Page<Album> findByArtistaNomeContaining(@Param("nomeArtista") String nomeArtista, Pageable pageable);
}
