package com.pet.api.controller;

import com.pet.api.model.Artista;
import com.pet.api.service.ArtistaService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/artista")
@SecurityRequirement(name = "bearerAuth")
public class ArtistaController {

    @Autowired
    ArtistaService artistaService;

    @GetMapping
    public Page<Artista> retornaTodosArtistasPaginado(Pageable pageable){

        return artistaService.retornaTodosArtistas(pageable);

    }

}
