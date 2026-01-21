package com.pet.api.service;

import com.pet.api.dto.AlbumCoverDTO;
import com.pet.api.model.Album;
import com.pet.api.model.AlbumCover;
import com.pet.api.repository.AlbumCoverRepository;
import com.pet.api.repository.AlbumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlbumCoverService {

    @Autowired
    AlbumCoverRepository albumCoverRepository;

    @Autowired
    AlbumRepository albumRepository;

    public AlbumCover createAlbumCover(AlbumCoverDTO albumCoverDTO){
        AlbumCover albumCover = new AlbumCover();
        if(albumCoverDTO.albumId() != null){
            Album album = albumRepository.findById(albumCoverDTO.albumId())
                    .orElseThrow(() -> new RuntimeException("Album não encontrado"));
            albumCover.setAlbum(album);
        }
        albumCover.setObjectKey(albumCoverDTO.objectKey());
        return albumCoverRepository.save(albumCover);
    }

    public Page<AlbumCover> getAllPaginado(Pageable pageable){
        return albumCoverRepository.findAll(pageable);
    }

    public AlbumCover getById(Long id){
        return albumCoverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capa de álbum não encontrada"));
    }

    public List<AlbumCover> getByAlbumId(Long albumId){
        return albumCoverRepository.findByAlbum_Id(albumId);
    }

    public AlbumCover updateAlbumCover(Long id, AlbumCoverDTO albumCoverDTO){
        AlbumCover albumCover = getById(id);
        if(albumCoverDTO.albumId() != null){
            Album album = albumRepository.findById(albumCoverDTO.albumId())
                    .orElseThrow(() -> new RuntimeException("Album não encontrado"));
            albumCover.setAlbum(album);
        }
        albumCover.setObjectKey(albumCoverDTO.objectKey());
        return albumCoverRepository.save(albumCover);
    }

    public void deleteAlbumCover(Long id){
        AlbumCover albumCover = getById(id);
        albumCoverRepository.delete(albumCover);
    }
}
