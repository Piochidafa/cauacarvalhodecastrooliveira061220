package com.pet.api.domain.regional.service;

import com.pet.api.domain.regional.dto.RegionalDTO;
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
class RegionalServiceTest {

    @Mock
    private RegionalRepository regionalRepository;

    @InjectMocks
    private RegionalService service;

    @Test
    void createRegionalPersistsData() {
        RegionalDTO dto = new RegionalDTO("Norte");
        when(regionalRepository.save(any(Regional.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Regional created = service.createRegional(dto);

        assertEquals("Norte", created.getNome());
    }

    @Test
    void getAllPaginadoReturnsPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Regional> page = new PageImpl<>(List.of(new Regional()), pageable, 1);

        when(regionalRepository.findAll(pageable)).thenReturn(page);

        Page<Regional> result = service.getAllPaginado(pageable);

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getByIdReturnsRegional() {
        Regional regional = new Regional();
        regional.setId(3L);
        regional.setNome("Sul");

        when(regionalRepository.findById(3L)).thenReturn(Optional.of(regional));

        Regional result = service.getById(3L);

        assertEquals("Sul", result.getNome());
    }

    @Test
    void updateRegionalUpdatesNome() {
        Regional regional = new Regional();
        regional.setId(4L);
        regional.setNome("Antigo");

        when(regionalRepository.findById(4L)).thenReturn(Optional.of(regional));
        when(regionalRepository.save(any(Regional.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Regional updated = service.updateRegional(4L, new RegionalDTO("Novo"));

        assertEquals("Novo", updated.getNome());
    }

    @Test
    void deleteRegionalRemovesEntity() {
        Regional regional = new Regional();
        regional.setId(5L);

        when(regionalRepository.findById(5L)).thenReturn(Optional.of(regional));

        service.deleteRegional(5L);

        verify(regionalRepository).delete(regional);
    }
}
