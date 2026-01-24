package com.pet.api.domain.artista.controller;

import com.pet.api.domain.artista.dto.ArtistaDTO;
import com.pet.api.domain.artista.dto.ArtistaResponseDTO;
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
    public Page<ArtistaResponseDTO> retornaTodosArtistasPaginado(Pageable pageable){
        return artistaService.getAllPaginado(pageable).map(ArtistaResponseDTO::fromArtista);
    }

    @PostMapping("/create")
    public ArtistaResponseDTO createArtista(@RequestBody ArtistaDTO artista){
        Artista novoArtista = artistaService.createArtista(artista);
        return ArtistaResponseDTO.fromArtista(novoArtista);
    }

    @GetMapping("/{id}")
    public ArtistaResponseDTO getArtistaById(@PathVariable Long id){
        Artista artista = artistaService.getById(id);
        return ArtistaResponseDTO.fromArtista(artista);
    }

    @PutMapping("/{id}")
    public ArtistaResponseDTO updateArtista(@PathVariable Long id, @RequestBody ArtistaDTO artista){
        Artista artistaAtualizado = artistaService.updateArtista(id, artista);
        return ArtistaResponseDTO.fromArtista(artistaAtualizado);
    }

    @DeleteMapping("/{id}")
    public void deleteArtista(@PathVariable Long id){
        artistaService.deleteArtista(id);
    }
}
