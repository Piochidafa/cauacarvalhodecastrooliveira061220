package com.pet.api.domain.artista.service;

import com.pet.api.domain.artista.dto.ArtistaDTO;
import com.pet.api.domain.artista.model.Artista;
import com.pet.api.domain.artista.repository.ArtistaRepository;
import com.pet.api.shared.service.MinioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArtistaServiceTest {

    @Mock
    private ArtistaRepository artistaRepository;

    @Mock
    private MinioService minioService;

    @InjectMocks
    private ArtistaService service;

    @Test
    void createArtistaPersistsData() {
        ArtistaDTO dto = new ArtistaDTO("Nome", null, null);
        when(artistaRepository.save(any(Artista.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Artista created = service.createArtista(dto);

        assertEquals("Nome", created.getNome());
        verify(artistaRepository).save(any(Artista.class));
    }

    @Test
    void updateArtistaUpdatesFields() {
        Artista existing = new Artista();
        existing.setId(1L);
        existing.setNome("Antigo");

        when(artistaRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(artistaRepository.save(any(Artista.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ArtistaDTO dto = new ArtistaDTO("Novo", null, null);
        Artista updated = service.updateArtista(1L, dto);

        assertEquals("Novo", updated.getNome());
    }

    @Test
    void updateArtistaImageReplacesExisting() throws IOException {
        Artista existing = new Artista();
        existing.setId(2L);
        existing.setImageKey("old-key");

        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", "data".getBytes());

        when(artistaRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(minioService.uploadFile(file)).thenReturn("new-key");
        when(minioService.getFileUrl("new-key")).thenReturn("url");
        when(artistaRepository.save(any(Artista.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Artista updated = service.updateArtistaImage(2L, file);

        verify(minioService).deleteFile("old-key");
        assertEquals("new-key", updated.getImageKey());
        assertEquals("url", updated.getImageUrl());
    }

    @Test
    void removeArtistaImageClearsFields() {
        Artista existing = new Artista();
        existing.setId(3L);
        existing.setImageKey("key");
        existing.setImageUrl("url");

        when(artistaRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(artistaRepository.save(any(Artista.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Artista updated = service.removeArtistaImage(3L);

        assertNull(updated.getImageKey());
        assertNull(updated.getImageUrl());
        try {
            verify(minioService).deleteFile("key");
        } catch (IOException e) {
            fail("Nao deveria lancar IOException");
        }
    }

    @Test
    void deleteArtistaRemovesImageIfPresent() {
        Artista existing = new Artista();
        existing.setId(4L);
        existing.setImageKey("key");

        when(artistaRepository.findById(4L)).thenReturn(Optional.of(existing));

        service.deleteArtista(4L);

        try {
            verify(minioService).deleteFile("key");
        } catch (IOException e) {
            fail("Nao deveria lancar IOException");
        }
        verify(artistaRepository).delete(existing);
    }

    @Test
    void getAllPaginadoReturnsPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Artista> page = new PageImpl<>(List.of(new Artista()), pageable, 1);

        when(artistaRepository.findAll(pageable)).thenReturn(page);

        Page<Artista> result = service.getAllPaginado(pageable);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void searchByNomeReturnsPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Artista> page = new PageImpl<>(List.of(new Artista()), pageable, 1);

        when(artistaRepository.findByNomeContainingIgnoreCase("ana", pageable)).thenReturn(page);

        Page<Artista> result = service.searchByNome("ana", pageable);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getByIdReturnsArtista() {
        Artista artista = new Artista();
        artista.setId(9L);
        artista.setNome("Maria");

        when(artistaRepository.findById(9L)).thenReturn(Optional.of(artista));

        Artista result = service.getById(9L);

        assertEquals("Maria", result.getNome());
    }
}
