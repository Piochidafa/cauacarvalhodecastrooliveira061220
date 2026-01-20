package com.pet.api.service;

import com.pet.api.model.Artista;
import com.pet.api.repository.ArtistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ArtistaService {

    @Autowired
    ArtistaRepository artistaRepository;

    public Page<Artista> retornaTodosArtistas(Pageable pageable){


        return artistaRepository.findAll(pageable);

    }

}
