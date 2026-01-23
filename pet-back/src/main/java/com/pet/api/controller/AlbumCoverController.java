package com.pet.api.controller;

import com.pet.api.dto.AlbumCoverDTO;
import com.pet.api.model.AlbumCover;
import com.pet.api.service.AlbumCoverService;
import com.pet.api.service.FileUploadService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/v1/album-cover")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Capas de Álbuns", description = "Gerenciamento de capas de álbuns")
public class AlbumCoverController {

    @Autowired
    AlbumCoverService albumCoverService;

    @Autowired
    FileUploadService fileUploadService;

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

    @PostMapping(value = "/upload/{albumId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<AlbumCover> uploadAlbumCovers(
            @PathVariable Long albumId,
            @RequestParam("files") MultipartFile[] files) throws IOException {
        return fileUploadService.uploadAlbumCovers(albumId, files);
    }
    public void deleteAlbumCover(@PathVariable Long id){
        albumCoverService.deleteAlbumCover(id);
    }
}
