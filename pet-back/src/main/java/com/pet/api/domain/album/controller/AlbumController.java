package com.pet.api.domain.album.controller;

import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.service.AlbumService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.info.Info;
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
    @Operation(summary = "Retorna todos os álbuns paginados")
    public Page<Album> retornaTodosAlbunsPaginado(Pageable pageable){
        return albumService.getAllPaginado(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtém um álbum por ID")
    public Album getAlbumById(@PathVariable Long id){
        return albumService.getById(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deleta um álbum por ID")
    public void deleteAlbum(@PathVariable Long id){
        albumService.deleteAlbum(id);
    }

    @GetMapping("/artista/{artistaId}")
    @Operation(summary = "Obtém todos os álbuns de um artista")
    public Page<Album> getAlbumsByArtista(@PathVariable Long artistaId, Pageable pageable){
        return albumService.getAlbumsByArtistaId(artistaId, pageable);
    }

    @GetMapping("/buscar")
    @Operation(summary = "Busca álbuns pelo nome do artista")
    public Page<Album> getAlbumsByArtistaNome(
            @RequestParam String nomeArtista, 
            Pageable pageable){
        return albumService.getAlbumsByArtistaNome(nomeArtista, pageable);
    }
}
