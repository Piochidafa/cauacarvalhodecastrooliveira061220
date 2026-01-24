package com.pet.api.domain.album.service;

import com.pet.api.domain.album.dto.AlbumDTO;
import com.pet.api.domain.album.exception.AlbumNotFoundException;
import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.repository.AlbumRepository;
import com.pet.api.domain.artista.model.Artista;
import com.pet.api.domain.artista.repository.ArtistaRepository;
import com.pet.api.domain.regional.model.Regional;
import com.pet.api.domain.regional.repository.RegionalRepository;
import com.pet.api.shared.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AlbumService {

    @Autowired
    AlbumRepository albumRepository;

    @Autowired
    ArtistaRepository artistaRepository;

    @Autowired
    RegionalRepository regionalRepository;

    public Album createAlbum(AlbumDTO albumDTO){
        Album album = new Album();
        album.setNome(albumDTO.nome());
        
        if(albumDTO.artistaId() != null){
            Artista artista = artistaRepository.findById(albumDTO.artistaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Artista com ID " + albumDTO.artistaId() + " não encontrado"));
            album.setArtista(artista);
        }
        
        if(albumDTO.regionalId() != null){
            Regional regional = regionalRepository.findById(albumDTO.regionalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Regional com ID " + albumDTO.regionalId() + " não encontrado"));
            album.setRegional(regional);
        }
        return albumRepository.save(album);
    }

    public Page<Album> getAllPaginado(Pageable pageable){
        return albumRepository.findAll(pageable);
    }

    public Album getById(Long id){
        return albumRepository.findById(id)
                .orElseThrow(() -> new AlbumNotFoundException("Álbum com ID " + id + " não encontrado"));
    }

    public Album updateAlbum(Long id, AlbumDTO albumDTO){
        Album album = getById(id);
        album.setNome(albumDTO.nome());
        
        if(albumDTO.artistaId() != null){
            Artista artista = artistaRepository.findById(albumDTO.artistaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Artista com ID " + albumDTO.artistaId() + " não encontrado"));
            album.setArtista(artista);
        }
        
        if(albumDTO.regionalId() != null){
            Regional regional = regionalRepository.findById(albumDTO.regionalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Regional com ID " + albumDTO.regionalId() + " não encontrado"));
            album.setRegional(regional);
        }
        return albumRepository.save(album);
    }

    public void deleteAlbum(Long id){
        Album album = getById(id);
        albumRepository.delete(album);
    }

    public Page<Album> getAlbumsByArtistaId(Long artistaId, Pageable pageable){
        return albumRepository.findByArtista_Id(artistaId, pageable);
    }

    public Page<Album> getAlbumsByArtistaNome(String nomeArtista, Pageable pageable){
        return albumRepository.findByArtistaNomeContaining(nomeArtista, pageable);
    }
}
