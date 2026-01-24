package com.pet.api.domain.albumcover.controller;

import com.pet.api.domain.albumcover.dto.AlbumCoverDTO;
import com.pet.api.domain.albumcover.model.AlbumCover;
import com.pet.api.domain.albumcover.service.AlbumCoverService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/album-cover")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Capas de Álbuns", description = "Gerenciamento de capas de álbuns")
public class AlbumCoverController {

    @Autowired
    AlbumCoverService albumCoverService;

    @GetMapping
    public Page<AlbumCover> retornaTodasCapasPaginado(Pageable pageable){
        return albumCoverService.getAllPaginado(pageable);
    }

    @PostMapping("/create")
    public AlbumCover createAlbumCover(@RequestBody AlbumCoverDTO albumCover){
        return albumCoverService.createAlbumCover(albumCover);
    }

    @GetMapping("/{id}")
    public AlbumCover getAlbumCoverById(@PathVariable Long id){
        return albumCoverService.getById(id);
    }

    @GetMapping("/album/{albumId}")
    public List<AlbumCover> getAlbumCoversByAlbumId(@PathVariable Long albumId){
        return albumCoverService.getByAlbumId(albumId);
    }

    @PutMapping("/{id}")
    public AlbumCover updateAlbumCover(@PathVariable Long id, @RequestBody AlbumCoverDTO albumCover){
        return albumCoverService.updateAlbumCover(id, albumCover);
    }

    @DeleteMapping("/{id}")
    public void deleteAlbumCover(@PathVariable Long id){
        albumCoverService.deleteAlbumCover(id);
    }
}
