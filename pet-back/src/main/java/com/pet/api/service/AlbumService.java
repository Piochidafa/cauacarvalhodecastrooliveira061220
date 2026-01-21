package com.pet.api.service;

import com.pet.api.dto.AlbumDTO;
import com.pet.api.model.Album;
import com.pet.api.model.Artista;
import com.pet.api.model.Regional;
import com.pet.api.repository.AlbumRepository;
import com.pet.api.repository.ArtistaRepository;
import com.pet.api.repository.RegionalRepository;
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
                    .orElseThrow(() -> new RuntimeException("Artista não encontrado"));
            album.setArtista(artista);
        }
        
        if(albumDTO.regionalId() != null){
            Regional regional = regionalRepository.findById(albumDTO.regionalId())
                    .orElseThrow(() -> new RuntimeException("Regional não encontrado"));
            album.setRegional(regional);
        }
        return albumRepository.save(album);
    }

    public Page<Album> getAllPaginado(Pageable pageable){
        return albumRepository.findAll(pageable);
    }

    public Album getById(Long id){
        return albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Album não encontrado"));
    }

    public Album updateAlbum(Long id, AlbumDTO albumDTO){
        Album album = getById(id);
        album.setNome(albumDTO.nome());
        
        if(albumDTO.artistaId() != null){
            Artista artista = artistaRepository.findById(albumDTO.artistaId())
                    .orElseThrow(() -> new RuntimeException("Artista não encontrado"));
            album.setArtista(artista);
        }
        
        if(albumDTO.regionalId() != null){
            Regional regional = regionalRepository.findById(albumDTO.regionalId())
                    .orElseThrow(() -> new RuntimeException("Regional não encontrado"));
            album.setRegional(regional);
        }
        return albumRepository.save(album);
    }

    public void deleteAlbum(Long id){
        Album album = getById(id);
        albumRepository.delete(album);
    }

    // Buscar álbuns por ID do artista
    public Page<Album> getAlbumsByArtistaId(Long artistaId, Pageable pageable){
        return albumRepository.findByArtista_Id(artistaId, pageable);
    }

    // Buscar álbuns por nome do artista com ordenação
    public Page<Album> getAlbumsByArtistaNome(String nomeArtista, Pageable pageable){
        return albumRepository.findByArtistaNomeContaining(nomeArtista, pageable);
    }
}
