package com.pet.api.domain.regional.service;

import com.pet.api.domain.regional.dto.RegionalDTO;
import com.pet.api.domain.regional.exception.RegionalNotFoundException;
import com.pet.api.domain.regional.model.Regional;
import com.pet.api.domain.regional.repository.RegionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class RegionalService {

    @Autowired
    RegionalRepository regionalRepository;

    public Regional createRegional(RegionalDTO regionalDTO){
        Regional regional = new Regional();
        regional.setNome(regionalDTO.nome());
        return regionalRepository.save(regional);
    }

    public Page<Regional> getAllPaginado(Pageable pageable){
        return regionalRepository.findAll(pageable);
    }

    public Regional getById(Long id){
        return regionalRepository.findById(id)
                .orElseThrow(() -> new RegionalNotFoundException("Regional com ID " + id + " não encontrado"));
    }

    public Regional updateRegional(Long id, RegionalDTO regionalDTO){
        Regional regional = getById(id);
        regional.setNome(regionalDTO.nome());
        return regionalRepository.save(regional);
    }

    public void deleteRegional(Long id){
        Regional regional = getById(id);
        regionalRepository.delete(regional);
    }
}
