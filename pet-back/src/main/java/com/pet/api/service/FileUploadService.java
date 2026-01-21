package com.pet.api.service;

import com.pet.api.model.Album;
import com.pet.api.model.AlbumCover;
import com.pet.api.repository.AlbumCoverRepository;
import com.pet.api.repository.AlbumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final String UPLOAD_DIR = "uploads/album-covers/";

    @Autowired
    private AlbumCoverRepository albumCoverRepository;

    @Autowired
    private AlbumRepository albumRepository;

    public List<AlbumCover> uploadAlbumCovers(Long albumId, MultipartFile[] files) throws IOException {
        // Verificar se o álbum existe
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum não encontrado"));

        // Criar diretório se não existir
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        List<AlbumCover> uploadedCovers = new ArrayList<>();

        // Processar cada arquivo
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                // Gerar nome único para o arquivo
                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename != null ? 
                        originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
                String uniqueFilename = UUID.randomUUID().toString() + extension;
                String objectKey = UPLOAD_DIR + uniqueFilename;

                // Salvar arquivo no disco
                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Criar registro no banco
                AlbumCover albumCover = new AlbumCover();
                albumCover.setAlbum(album);
                albumCover.setObjectKey(objectKey);
                AlbumCover saved = albumCoverRepository.save(albumCover);
                uploadedCovers.add(saved);
            }
        }

        return uploadedCovers;
    }
}
