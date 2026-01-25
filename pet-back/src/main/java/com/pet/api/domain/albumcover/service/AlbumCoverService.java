package com.pet.api.domain.albumcover.service;

import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.repository.AlbumRepository;
import com.pet.api.domain.albumcover.dto.AlbumCoverDTO;
import com.pet.api.domain.albumcover.exception.AlbumCoverNotFoundException;
import com.pet.api.domain.albumcover.model.AlbumCover;
import com.pet.api.domain.albumcover.repository.AlbumCoverRepository;
import com.pet.api.shared.exception.ResourceNotFoundException;
import com.pet.api.shared.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class AlbumCoverService {

    @Autowired
    AlbumCoverRepository albumCoverRepository;

    @Autowired
    AlbumRepository albumRepository;

    @Autowired
    MinioService minioService;

    public AlbumCover createAlbumCover(Long albumId, MultipartFile file) throws IOException {
        String objectKey = minioService.uploadFile(file);
        
        AlbumCover albumCover = new AlbumCover();
        if(albumId != null){
            Album album = albumRepository.findById(albumId)
                    .orElseThrow(() -> new ResourceNotFoundException("Álbum com ID " + albumId + " não encontrado"));
            albumCover.setAlbum(album);
        }
        albumCover.setObjectKey(objectKey);
        return albumCoverRepository.save(albumCover);
    }

    public AlbumCover createAlbumCoverWithKey(Long albumId, String objectKey) {
        AlbumCover albumCover = new AlbumCover();
        if(albumId != null){
            Album album = albumRepository.findById(albumId)
                    .orElseThrow(() -> new ResourceNotFoundException("Álbum com ID " + albumId + " não encontrado"));
            albumCover.setAlbum(album);
        }
        albumCover.setObjectKey(objectKey);
        return albumCoverRepository.save(albumCover);
    }

    public Page<AlbumCover> getAllPaginado(Pageable pageable){
        return albumCoverRepository.findAll(pageable);
    }

    public AlbumCover getById(Long id){
        return albumCoverRepository.findById(id)
                .orElseThrow(() -> new AlbumCoverNotFoundException("Capa de álbum com ID " + id + " não encontrada"));
    }

    public List<AlbumCover> getByAlbumId(Long albumId){
        return albumCoverRepository.findByAlbum_Id(albumId);
    }

    public AlbumCover updateAlbumCover(Long id, AlbumCoverDTO albumCoverDTO){
        AlbumCover albumCover = getById(id);
        if(albumCoverDTO.albumId() != null){
            Album album = albumRepository.findById(albumCoverDTO.albumId())
                    .orElseThrow(() -> new ResourceNotFoundException("Álbum com ID " + albumCoverDTO.albumId() + " não encontrado"));
            albumCover.setAlbum(album);
        }
        albumCover.setObjectKey(albumCoverDTO.objectKey());
        return albumCoverRepository.save(albumCover);
    }

    public void deleteAlbumCover(Long id){
        AlbumCover albumCover = getById(id);
        try {
            minioService.deleteFile(albumCover.getObjectKey());
        } catch (IOException e) {
            throw new RuntimeException("Erro ao deletar arquivo do MinIO: " + e.getMessage());
        }
        albumCoverRepository.delete(albumCover);
    }
}
