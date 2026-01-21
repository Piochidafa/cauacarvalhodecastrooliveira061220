package com.pet.api.repository;

import com.pet.api.model.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
    
    // Buscar álbuns por ID do artista
    Page<Album> findByArtista_Id(Long artistaId, Pageable pageable);
    
    // Buscar álbuns por nome do artista (case insensitive)
    @Query("SELECT a FROM Album a WHERE LOWER(a.artista.nome) LIKE LOWER(CONCAT('%', :nomeArtista, '%'))")
    Page<Album> findByArtistaNomeContaining(@Param("nomeArtista") String nomeArtista, Pageable pageable);
}
