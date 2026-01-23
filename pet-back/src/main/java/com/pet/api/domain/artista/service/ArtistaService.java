package com.pet.api.domain.artista.service;

import com.pet.api.domain.artista.dto.ArtistaDTO;
import com.pet.api.domain.artista.exception.ArtistaNotFoundException;
import com.pet.api.domain.artista.model.Artista;
import com.pet.api.domain.artista.repository.ArtistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ArtistaService {

    @Autowired
    ArtistaRepository artistaRepository;

    public Artista createArtista(ArtistaDTO artistaDTO){
        Artista artista = new Artista();
        artista.setNome(artistaDTO.nome());
        return artistaRepository.save(artista);
    }

    public Page<Artista> getAllPaginado(Pageable pageable){
        return artistaRepository.findAll(pageable);
    }

    public Artista getByName(String nome){
        return artistaRepository.getByNome(nome);
    }

    public Artista getById(Long id){
        return artistaRepository.findById(id)
                .orElseThrow(() -> new ArtistaNotFoundException("Artista com ID " + id + " não encontrado"));
    }

    public Artista updateArtista(Long id, ArtistaDTO artistaDTO){
        Artista artista = getById(id);
        artista.setNome(artistaDTO.nome());
        return artistaRepository.save(artista);
    }

    public void deleteArtista(Long id){
        Artista artista = getById(id);
        artistaRepository.delete(artista);
    }
}
