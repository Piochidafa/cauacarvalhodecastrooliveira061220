package com.pet.api.domain.albumcover.service;

import com.pet.api.domain.album.model.Album;
import com.pet.api.domain.album.repository.AlbumRepository;
import com.pet.api.domain.albumcover.model.AlbumCover;
import com.pet.api.domain.albumcover.repository.AlbumCoverRepository;
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
class AlbumCoverServiceTest {

    @Mock
    private AlbumCoverRepository albumCoverRepository;

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private MinioService minioService;

    @InjectMocks
    private AlbumCoverService service;

    @Test
    void createAlbumCoverAssociatesAlbum() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", "data".getBytes());
        Album album = new Album();
        album.setId(1L);

        when(minioService.uploadFile(file)).thenReturn("key");
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));
        when(albumCoverRepository.save(any(AlbumCover.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AlbumCover cover = service.createAlbumCover(1L, file);

        assertEquals(album, cover.getAlbum());
        assertEquals("key", cover.getObjectKey());
    }

    @Test
    void createAlbumCoversUploadsAllFiles() throws IOException {
        MockMultipartFile fileA = new MockMultipartFile("files", "a.png", "image/png", "a".getBytes());
        MockMultipartFile fileB = new MockMultipartFile("files", "b.png", "image/png", "b".getBytes());
        Album album = new Album();
        album.setId(2L);

        when(minioService.uploadFile(fileA)).thenReturn("k1");
        when(minioService.uploadFile(fileB)).thenReturn("k2");
        when(albumRepository.findById(2L)).thenReturn(Optional.of(album));
        when(albumCoverRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<AlbumCover> covers = service.createAlbumCovers(2L, List.of(fileA, fileB));

        assertEquals(2, covers.size());
        assertEquals(album, covers.get(0).getAlbum());
        assertEquals(album, covers.get(1).getAlbum());
    }

    @Test
    void deleteAlbumCoverRemovesFromMinioAndDb() {
        AlbumCover cover = new AlbumCover();
        cover.setId(10L);
        cover.setObjectKey("key");

        when(albumCoverRepository.findById(10L)).thenReturn(Optional.of(cover));

        service.deleteAlbumCover(10L);

        verify(albumCoverRepository).delete(cover);
        try {
            verify(minioService).deleteFile("key");
        } catch (IOException e) {
            fail("Nao deveria lancar IOException");
        }
    }

    @Test
    void createAlbumCoverWithKeyAssociatesAlbum() {
        Album album = new Album();
        album.setId(3L);

        when(albumRepository.findById(3L)).thenReturn(Optional.of(album));
        when(albumCoverRepository.save(any(AlbumCover.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AlbumCover cover = service.createAlbumCoverWithKey(3L, "key-1");

        assertEquals("key-1", cover.getObjectKey());
        assertEquals(album, cover.getAlbum());
    }

    @Test
    void getByIdReturnsCover() {
        AlbumCover cover = new AlbumCover();
        cover.setId(11L);

        when(albumCoverRepository.findById(11L)).thenReturn(Optional.of(cover));

        AlbumCover result = service.getById(11L);

        assertEquals(11L, result.getId());
    }

    @Test
    void getByAlbumIdReturnsList() {
        AlbumCover cover = new AlbumCover();
        cover.setId(12L);

        when(albumCoverRepository.findByAlbum_Id(5L)).thenReturn(List.of(cover));

        List<AlbumCover> result = service.getByAlbumId(5L);

        assertEquals(1, result.size());
    }

    @Test
    void getAllPaginadoReturnsPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<AlbumCover> page = new PageImpl<>(List.of(new AlbumCover()), pageable, 1);

        when(albumCoverRepository.findAll(pageable)).thenReturn(page);

        Page<AlbumCover> result = service.getAllPaginado(pageable);

        assertEquals(1, result.getTotalElements());
    }
}
