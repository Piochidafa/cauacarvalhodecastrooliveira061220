package com.pet.api.domain.album.service;

import com.pet.api.domain.album.dto.AlbumDTO;
import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.repository.AlbumRepository;
import com.pet.api.domain.albumcover.repository.AlbumCoverRepository;
import com.pet.api.domain.artista.model.Artista;
import com.pet.api.domain.artista.repository.ArtistaRepository;
import com.pet.api.domain.regional.model.Regional;
import com.pet.api.domain.regional.repository.RegionalRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlbumServiceTest {

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private ArtistaRepository artistaRepository;

    @Mock
    private RegionalRepository regionalRepository;

    @Mock
    private AlbumCoverRepository albumCoverRepository;

    @InjectMocks
    private AlbumService service;

    @Test
    void createAlbumAssociatesArtistaAndRegional() {
        Artista artista = new Artista();
        artista.setId(1L);
        Regional regional = new Regional();
        regional.setId(2L);

        when(artistaRepository.findById(1L)).thenReturn(Optional.of(artista));
        when(regionalRepository.findById(2L)).thenReturn(Optional.of(regional));
        when(albumRepository.save(any(Album.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AlbumDTO dto = new AlbumDTO("Album", 1L, 2L);
        Album created = service.createAlbum(dto);

        assertEquals("Album", created.getNome());
        assertEquals(artista, created.getArtista());
        assertEquals(regional, created.getRegional());
    }

    @Test
    void updateAlbumUpdatesFields() {
        Album existing = new Album();
        existing.setId(3L);
        existing.setNome("Antigo");

        Artista artista = new Artista();
        artista.setId(4L);
        Regional regional = new Regional();
        regional.setId(5L);

        when(albumRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(artistaRepository.findById(4L)).thenReturn(Optional.of(artista));
        when(regionalRepository.findById(5L)).thenReturn(Optional.of(regional));
        when(albumRepository.save(any(Album.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AlbumDTO dto = new AlbumDTO("Novo", 4L, 5L);
        Album updated = service.updateAlbum(3L, dto);

        assertEquals("Novo", updated.getNome());
        assertEquals(artista, updated.getArtista());
        assertEquals(regional, updated.getRegional());
    }

    @Test
    void deleteAlbumRemovesCoversAndAlbum() {
        Album existing = new Album();
        existing.setId(6L);

        when(albumRepository.findById(6L)).thenReturn(Optional.of(existing));

        service.deleteAlbum(6L);

        verify(albumCoverRepository).deleteByAlbum_Id(6L);
        verify(albumRepository).delete(existing);
    }

    @Test
    void getByIdReturnsAlbum() {
        Album existing = new Album();
        existing.setId(7L);
        existing.setNome("A");

        when(albumRepository.findById(7L)).thenReturn(Optional.of(existing));

        Album result = service.getById(7L);

        assertEquals("A", result.getNome());
    }

    @Test
    void getAllPaginadoReturnsPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Album> page = new PageImpl<>(List.of(new Album()), pageable, 1);

        when(albumRepository.findAll(pageable)).thenReturn(page);

        Page<Album> result = service.getAllPaginado(pageable);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getAlbumsByArtistaIdReturnsPage() {
        PageRequest pageable = PageRequest.of(0, 5);
        Page<Album> page = new PageImpl<>(List.of(new Album()), pageable, 1);

        when(albumRepository.findByArtista_Id(9L, pageable)).thenReturn(page);

        Page<Album> result = service.getAlbumsByArtistaId(9L, pageable);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getAlbumsByArtistaNomeReturnsPage() {
        PageRequest pageable = PageRequest.of(0, 5);
        Page<Album> page = new PageImpl<>(List.of(new Album()), pageable, 1);

        when(albumRepository.findByArtistaNomeContaining("Joao", pageable)).thenReturn(page);

        Page<Album> result = service.getAlbumsByArtistaNome("Joao", pageable);

        assertEquals(1, result.getTotalElements());
    }

}
