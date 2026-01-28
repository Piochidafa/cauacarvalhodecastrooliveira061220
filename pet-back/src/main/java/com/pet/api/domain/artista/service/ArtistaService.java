package com.pet.api.domain.artista.service;

import com.pet.api.domain.artista.dto.ArtistaDTO;
import com.pet.api.domain.artista.exception.ArtistaNotFoundException;
import com.pet.api.domain.artista.model.Artista;
import com.pet.api.domain.artista.repository.ArtistaRepository;
import com.pet.api.shared.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ArtistaService {

    @Autowired
    ArtistaRepository artistaRepository;

    @Autowired
    MinioService minioService;

    public Artista createArtista(ArtistaDTO artistaDTO){
        Artista artista = new Artista();
        artista.setNome(artistaDTO.nome());
        artista.setImageKey(artistaDTO.imageKey());
        artista.setImageUrl(artistaDTO.imageUrl());
        return artistaRepository.save(artista);
    }

    public Page<Artista> getAllPaginado(Pageable pageable){
        return artistaRepository.findAll(pageable);
    }

    public Page<Artista> searchByNome(String nome, Pageable pageable){
        return artistaRepository.findByNomeContainingIgnoreCase(nome, pageable);
    }

    public Artista getByName(String nome){
        return artistaRepository.getByNome(nome);
    }

    public Artista getById(Long id){
        return artistaRepository.findById(id)
                .orElseThrow(() -> new ArtistaNotFoundException("Artista com ID " + id + " não encontrado"));
    }

    public Artista updateArtista(Long id, ArtistaDTO artistaDTO){
        Artista artista = getById(id);
        artista.setNome(artistaDTO.nome());
        if (artistaDTO.imageKey() != null) {
            artista.setImageKey(artistaDTO.imageKey());
        }
        if (artistaDTO.imageUrl() != null) {
            artista.setImageUrl(artistaDTO.imageUrl());
        }
        return artistaRepository.save(artista);
    }

    public void deleteArtista(Long id){
        Artista artista = getById(id);
        if (artista.getImageKey() != null && !artista.getImageKey().isBlank()) {
            try {
                minioService.deleteFile(artista.getImageKey());
            } catch (IOException e) {
                throw new RuntimeException("Erro ao deletar imagem do artista no MinIO: " + e.getMessage());
            }
        }
        artistaRepository.delete(artista);
    }

    public Artista updateArtistaImage(Long id, MultipartFile file) throws IOException {
        Artista artista = getById(id);

        if (file == null || file.isEmpty()) {
            return artista;
        }

        if (artista.getImageKey() != null && !artista.getImageKey().isBlank()) {
            minioService.deleteFile(artista.getImageKey());
        }

        String objectKey = minioService.uploadFile(file);
        artista.setImageKey(objectKey);
        artista.setImageUrl(minioService.getFileUrl(objectKey));

        return artistaRepository.save(artista);
    }

    public Artista removeArtistaImage(Long id) {
        Artista artista = getById(id);

        if (artista.getImageKey() != null && !artista.getImageKey().isBlank()) {
            try {
                minioService.deleteFile(artista.getImageKey());
            } catch (IOException e) {
                throw new RuntimeException("Erro ao deletar imagem do artista no MinIO: " + e.getMessage());
            }
        }

        artista.setImageKey(null);
        artista.setImageUrl(null);
        return artistaRepository.save(artista);
    }
}
