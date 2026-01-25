package com.pet.api.domain.artista.repository;

import com.pet.api.domain.artista.model.Artista;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtistaRepository extends JpaRepository<Artista, Long> {
    Artista getByNome(String nome);

    Page<Artista> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}
