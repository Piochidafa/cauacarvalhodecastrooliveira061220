package com.pet.api.domain.albumcover.controller;

import com.pet.api.domain.albumcover.dto.AlbumCoverResponseDTO;
import com.pet.api.domain.albumcover.dto.AlbumCoverDTO;
import com.pet.api.domain.albumcover.model.AlbumCover;
import com.pet.api.domain.albumcover.service.AlbumCoverService;
import com.pet.api.shared.service.MinioService;
import io.swagger.v3.oas.annotations.Operation;
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
    @Operation(summary = "Retorna capas de álbuns paginadas")
    public Page<AlbumCover> retornaTodasCapasPaginado(Pageable pageable){
        return albumCoverService.getAllPaginado(pageable);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Faz upload de capa de álbum")
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

    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Faz upload de múltiplas capas de álbum")
    public ResponseEntity<List<AlbumCover>> uploadAlbumCovers(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "albumId", required = false) Long albumId
    ) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            List<AlbumCover> albumCovers = albumCoverService.createAlbumCovers(albumId, files);
            return ResponseEntity.ok(albumCovers);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtém capa de álbum por ID")
    public AlbumCover getAlbumCoverById(@PathVariable Long id){
        return albumCoverService.getById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza capa de álbum por ID")
    public ResponseEntity<AlbumCover> updateAlbumCover(@PathVariable Long id, @RequestBody AlbumCoverDTO albumCoverDTO){
        AlbumCover albumCover = albumCoverService.updateAlbumCover(id, albumCoverDTO);
        return ResponseEntity.ok(albumCover);
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Baixa arquivo da capa do álbum")
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
    @Operation(summary = "Obtém URL da capa do álbum")
    public ResponseEntity<String> getAlbumCoverUrl(@PathVariable Long id) {
        AlbumCover albumCover = albumCoverService.getById(id);
        String url = minioService.getFileUrl(albumCover.getObjectKey());
        return ResponseEntity.ok(url);
    }

    @GetMapping("/album/{albumId}")
    @Operation(summary = "Lista capas de um álbum")
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
    @Operation(summary = "Deleta capa de álbum por ID")
    public ResponseEntity<Void> deleteAlbumCover(@PathVariable Long id){
        albumCoverService.deleteAlbumCover(id);
        return ResponseEntity.noContent().build();
    }
}
