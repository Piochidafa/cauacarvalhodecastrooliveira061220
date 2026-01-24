package com.pet.api.domain.regional.controller;

import com.pet.api.domain.regional.dto.RegionalDTO;
import com.pet.api.domain.regional.model.Regional;
import com.pet.api.domain.regional.service.RegionalService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/regional")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Regionais", description = "Gerenciamento de regionais")
public class RegionalController {

    @Autowired
    RegionalService regionalService;

    @GetMapping
    public Page<Regional> retornaTodosRegionaisPaginado(Pageable pageable){
        return regionalService.getAllPaginado(pageable);
    }

    @PostMapping("/create")
    public Regional createRegional(@RequestBody RegionalDTO regional){
        return regionalService.createRegional(regional);
    }

    @GetMapping("/{id}")
    public Regional getRegionalById(@PathVariable Long id){
        return regionalService.getById(id);
    }

    @PutMapping("/{id}")
    public Regional updateRegional(@PathVariable Long id, @RequestBody RegionalDTO regional){
        return regionalService.updateRegional(id, regional);
    }

    @DeleteMapping("/{id}")
    public void deleteRegional(@PathVariable Long id){
        regionalService.deleteRegional(id);
    }
}
