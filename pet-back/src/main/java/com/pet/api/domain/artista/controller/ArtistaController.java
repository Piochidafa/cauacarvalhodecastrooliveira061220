package com.pet.api.domain.artista.controller;

import com.pet.api.domain.artista.dto.ArtistaDTO;
import com.pet.api.domain.artista.dto.ArtistaDetailResponseDTO;
import com.pet.api.domain.artista.dto.ArtistaResponseDTO;
import com.pet.api.domain.artista.model.Artista;
import com.pet.api.domain.artista.service.ArtistaService;
import com.pet.api.domain.album.dto.AlbumResponseDTO;
import com.pet.api.domain.albumcover.dto.AlbumCoverResponseDTO;
import com.pet.api.shared.service.MinioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/artista")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Artistas", description = "Gerenciamento de artistas")
public class ArtistaController {

    @Autowired
    ArtistaService artistaService;

    @Autowired
    MinioService minioService;

    @GetMapping
    public Page<ArtistaDetailResponseDTO> retornaTodosArtistasPaginado(Pageable pageable){
        return artistaService.getAllPaginado(pageable).map(artista -> {
            var albuns = artista.getAlbuns().stream()
                .map(album -> {
                    var capas = album.getCapas().stream()
                        .map(capa -> AlbumCoverResponseDTO.fromAlbumCover(
                            capa,
                            minioService.getFileUrl(capa.getObjectKey())
                        ))
                        .collect(Collectors.toList());
                    
                    return AlbumResponseDTO.fromAlbum(album, capas);
                })
                .collect(Collectors.toList());
            
            return ArtistaDetailResponseDTO.fromArtista(artista, albuns);
        });
    }

    @GetMapping("/buscar")
    public Page<ArtistaDetailResponseDTO> buscarArtistasPorNome(
            @RequestParam String nome,
            Pageable pageable){
        return artistaService.searchByNome(nome, pageable).map(artista -> {
            var albuns = artista.getAlbuns().stream()
                .map(album -> {
                    var capas = album.getCapas().stream()
                        .map(capa -> AlbumCoverResponseDTO.fromAlbumCover(
                            capa,
                            minioService.getFileUrl(capa.getObjectKey())
                        ))
                        .collect(Collectors.toList());

                    return AlbumResponseDTO.fromAlbum(album, capas);
                })
                .collect(Collectors.toList());

            return ArtistaDetailResponseDTO.fromArtista(artista, albuns);
        });
    }

    @PostMapping("/create")
    public ArtistaResponseDTO createArtista(@RequestBody ArtistaDTO artista){
        Artista novoArtista = artistaService.createArtista(artista);
        return ArtistaResponseDTO.fromArtista(novoArtista);
    }

    @GetMapping("/{id}")
    public ArtistaDetailResponseDTO getArtistaById(@PathVariable Long id){
        Artista artista = artistaService.getById(id);
        
        var albuns = artista.getAlbuns().stream()
            .map(album -> {
                var capas = album.getCapas().stream()
                    .map(capa -> AlbumCoverResponseDTO.fromAlbumCover(
                        capa,
                        minioService.getFileUrl(capa.getObjectKey())
                    ))
                    .collect(Collectors.toList());
                
                return AlbumResponseDTO.fromAlbum(album, capas);
            })
            .collect(Collectors.toList());
        
        return ArtistaDetailResponseDTO.fromArtista(artista, albuns);
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
