package com.pet.api.domain.artista.controller;

import com.pet.api.domain.artista.dto.ArtistaDTO;
import com.pet.api.domain.artista.dto.ArtistaDetailResponseDTO;
import com.pet.api.domain.artista.dto.ArtistaResponseDTO;
import com.pet.api.domain.artista.model.Artista;
import com.pet.api.domain.artista.service.ArtistaService;
import com.pet.api.domain.album.dto.AlbumResponseDTO;
import com.pet.api.domain.albumcover.dto.AlbumCoverResponseDTO;
import com.pet.api.shared.service.MinioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    @Operation(summary = "Retorna artistas paginados")
    public Page<ArtistaDetailResponseDTO> retornaTodosArtistasPaginado(Pageable pageable){
        return artistaService.getAllPaginado(pageable).map(artista -> {
            enrichImageUrl(artista);
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
    @Operation(summary = "Busca artistas por nome")
    public Page<ArtistaDetailResponseDTO> buscarArtistasPorNome(
            @RequestParam String nome,
            Pageable pageable){
        return artistaService.searchByNome(nome, pageable).map(artista -> {
            enrichImageUrl(artista);
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
    @Operation(summary = "Cria um novo artista")
    public ArtistaResponseDTO createArtista(@RequestBody ArtistaDTO artista){
        Artista novoArtista = artistaService.createArtista(artista);
        return ArtistaResponseDTO.fromArtista(novoArtista);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtém um artista por ID")
    public ArtistaDetailResponseDTO getArtistaById(@PathVariable Long id){
        Artista artista = artistaService.getById(id);
        enrichImageUrl(artista);
        
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
    @Operation(summary = "Atualiza um artista por ID")
    public ArtistaResponseDTO updateArtista(@PathVariable Long id, @RequestBody ArtistaDTO artista){
        Artista artistaAtualizado = artistaService.updateArtista(id, artista);
        enrichImageUrl(artistaAtualizado);
        return ArtistaResponseDTO.fromArtista(artistaAtualizado);
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Faz upload de imagem do artista (opcional)")
    public ResponseEntity<ArtistaResponseDTO> uploadArtistaImage(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Artista artistaAtualizado = artistaService.updateArtistaImage(id, file);
            enrichImageUrl(artistaAtualizado);
            return ResponseEntity.ok(ArtistaResponseDTO.fromArtista(artistaAtualizado));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}/image")
    @Operation(summary = "Remove imagem do artista")
    public ResponseEntity<ArtistaResponseDTO> removeArtistaImage(@PathVariable Long id) {
        Artista artistaAtualizado = artistaService.removeArtistaImage(id);
        return ResponseEntity.ok(ArtistaResponseDTO.fromArtista(artistaAtualizado));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deleta um artista por ID")
    public void deleteArtista(@PathVariable Long id){
        artistaService.deleteArtista(id);
    }

    private void enrichImageUrl(Artista artista) {
        if (artista.getImageKey() != null && !artista.getImageKey().isBlank()) {
            artista.setImageUrl(minioService.getFileUrl(artista.getImageKey()));
        }
    }
}
