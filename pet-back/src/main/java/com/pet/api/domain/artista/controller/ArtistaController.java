package com.pet.api.domain.artista.controller;

import com.pet.api.domain.artista.dto.ArtistaDTO;
import com.pet.api.domain.artista.model.Artista;
import com.pet.api.domain.artista.service.ArtistaService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/artista")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Artistas", description = "Gerenciamento de artistas")
public class ArtistaController {

    @Autowired
    ArtistaService artistaService;

    @GetMapping
    public Page<Artista> retornaTodosArtistasPaginado(Pageable pageable){
        return artistaService.getAllPaginado(pageable);
    }

    @PostMapping("/create")
    public Artista createArtista(@RequestBody ArtistaDTO artista){
        return artistaService.createArtista(artista);
    }

    @GetMapping("/{id}")
    public Artista getArtistaById(@PathVariable Long id){
        return artistaService.getById(id);
    }

    @PutMapping("/{id}")
    public Artista updateArtista(@PathVariable Long id, @RequestBody ArtistaDTO artista){
        return artistaService.updateArtista(id, artista);
    }

    @DeleteMapping("/{id}")
    public void deleteArtista(@PathVariable Long id){
        artistaService.deleteArtista(id);
    }
}
