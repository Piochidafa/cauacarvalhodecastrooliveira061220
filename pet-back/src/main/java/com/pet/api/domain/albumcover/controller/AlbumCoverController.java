package com.pet.api.domain.albumcover.controller;

import com.pet.api.domain.albumcover.dto.AlbumCoverResponseDTO;
import com.pet.api.domain.albumcover.dto.AlbumCoverDTO;
import com.pet.api.domain.albumcover.model.AlbumCover;
import com.pet.api.domain.albumcover.service.AlbumCoverService;
import com.pet.api.shared.service.MinioService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/album-cover")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Capas de Álbuns", description = "Gerenciamento de capas de álbuns")
public class AlbumCoverController {

    @Autowired
    AlbumCoverService albumCoverService;

    @Autowired
    MinioService minioService;

    @GetMapping
    public Page<AlbumCover> retornaTodasCapasPaginado(Pageable pageable){
        return albumCoverService.getAllPaginado(pageable);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AlbumCover> uploadAlbumCover(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "albumId", required = false) Long albumId
    ) {
        try {
            AlbumCover albumCover = albumCoverService.createAlbumCover(albumId, file);
            return ResponseEntity.ok(albumCover);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public AlbumCover getAlbumCoverById(@PathVariable Long id){
        return albumCoverService.getById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlbumCover> updateAlbumCover(@PathVariable Long id, @RequestBody AlbumCoverDTO albumCoverDTO){
        AlbumCover albumCover = albumCoverService.updateAlbumCover(id, albumCoverDTO);
        return ResponseEntity.ok(albumCover);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> downloadAlbumCover(@PathVariable Long id) {
        try {
            AlbumCover albumCover = albumCoverService.getById(id);
            InputStream inputStream = minioService.downloadFile(albumCover.getObjectKey());
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + albumCover.getObjectKey() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(new InputStreamResource(inputStream));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/url")
    public ResponseEntity<String> getAlbumCoverUrl(@PathVariable Long id) {
        AlbumCover albumCover = albumCoverService.getById(id);
        String url = minioService.getFileUrl(albumCover.getObjectKey());
        return ResponseEntity.ok(url);
    }

    @GetMapping("/album/{albumId}")
    public List<AlbumCoverResponseDTO> getAlbumCoversByAlbumId(@PathVariable Long albumId){
        return albumCoverService.getByAlbumId(albumId)
            .stream()
            .map(cover -> AlbumCoverResponseDTO.fromAlbumCover(
                cover,
                minioService.getFileUrl(cover.getObjectKey())
            ))
            .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbumCover(@PathVariable Long id){
        albumCoverService.deleteAlbumCover(id);
        return ResponseEntity.noContent().build();
    }
}
