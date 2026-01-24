package com.pet.api.domain.album.controller;

import com.pet.api.domain.album.dto.AlbumDTO;
import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.service.AlbumService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/album")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Álbuns", description = "Gerenciamento de álbuns")
public class AlbumController {

    @Autowired
    AlbumService albumService;

    @GetMapping
    public Page<Album> retornaTodosAlbunsPaginado(Pageable pageable){
        return albumService.getAllPaginado(pageable);
    }

    @PostMapping("/create")
    public Album createAlbum(@RequestBody AlbumDTO album){
        return albumService.createAlbum(album);
    }

    @GetMapping("/{id}")
    public Album getAlbumById(@PathVariable Long id){
        return albumService.getById(id);
    }

    @PutMapping("/{id}")
    public Album updateAlbum(@PathVariable Long id, @RequestBody AlbumDTO album){
        return albumService.updateAlbum(id, album);
    }

    @DeleteMapping("/{id}")
    public void deleteAlbum(@PathVariable Long id){
        albumService.deleteAlbum(id);
    }

    @GetMapping("/artista/{artistaId}")
    public Page<Album> getAlbumsByArtista(@PathVariable Long artistaId, Pageable pageable){
        return albumService.getAlbumsByArtistaId(artistaId, pageable);
    }

    @GetMapping("/buscar")
    public Page<Album> getAlbumsByArtistaNome(
            @RequestParam String nomeArtista, 
            Pageable pageable){
        return albumService.getAlbumsByArtistaNome(nomeArtista, pageable);
    }
}
