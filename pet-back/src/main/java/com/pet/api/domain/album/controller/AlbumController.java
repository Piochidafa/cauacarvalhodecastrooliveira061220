package com.pet.api.domain.album.controller;

import com.pet.api.domain.album.dto.AlbumDTO;
import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.service.AlbumService;
import com.pet.api.domain.albumcover.service.AlbumCoverService;
import com.pet.api.shared.service.MinioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/v1/album")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Álbuns", description = "Gerenciamento de álbuns")
public class AlbumController {

    @Autowired
    AlbumService albumService;

    @Autowired
    AlbumCoverService albumCoverService;

    @Autowired
    MinioService minioService;

    @GetMapping
    @Operation(summary = "Retorna todos os álbuns paginados")
    public Page<Album> retornaTodosAlbunsPaginado(Pageable pageable){
        return albumService.getAllPaginado(pageable);
    }

    @PostMapping
    @Operation(summary = "Cria um novo álbum")
    public Album createAlbum(@RequestBody AlbumDTO albumDTO){
        return albumService.createAlbum(albumDTO);
    }

    @PostMapping(value = "/with-cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cria um novo álbum com capa")
    public Album createAlbumWithCover(
            @RequestParam("nome") String nome,
            @RequestParam("artistaId") Long artistaId,
            @RequestParam("regionalId") Long regionalId,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {
        AlbumDTO albumDTO = new AlbumDTO(nome, artistaId, regionalId);
        Album album = albumService.createAlbum(albumDTO);

        // Se houver arquivo, fazer upload
        if (file != null && !file.isEmpty()) {
            String objectKey = minioService.uploadFile(file);
            albumCoverService.createAlbumCoverWithKey(album.getId(), objectKey);
        }

        // Recarregar para incluir capas
        return albumService.getById(album.getId());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtém um álbum por ID")
    public Album getAlbumById(@PathVariable Long id){
        return albumService.getById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um álbum por ID")
    public Album updateAlbum(@PathVariable Long id, @RequestBody AlbumDTO albumDTO){
        return albumService.updateAlbum(id, albumDTO);
    }

    @PutMapping(value = "/{id}/with-cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Atualiza um álbum com capa")
    public Album updateAlbumWithCover(
            @PathVariable Long id,
            @RequestParam("nome") String nome,
            @RequestParam("artistaId") Long artistaId,
            @RequestParam("regionalId") Long regionalId,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {
        AlbumDTO albumDTO = new AlbumDTO(nome, artistaId, regionalId);
        Album album = albumService.updateAlbum(id, albumDTO);

        // Se houver arquivo, fazer upload
        if (file != null && !file.isEmpty()) {
            String objectKey = minioService.uploadFile(file);
            albumCoverService.createAlbumCoverWithKey(album.getId(), objectKey);
        }

        // Recarregar para incluir capas
        return albumService.getById(album.getId());
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
