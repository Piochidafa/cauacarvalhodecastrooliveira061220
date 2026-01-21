package com.pet.api.service;

import com.pet.api.dto.RegionalExternaDTO;
import com.pet.api.model.Regional;
import com.pet.api.repository.RegionalRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegionalSyncService {

    private static final Logger logger = LoggerFactory.getLogger(RegionalSyncService.class);
    private static final String API_URL = "https://integrador-argus-api.geia.vip/v1/regionais";
    private static final String FILTRO_NOME = "REGIONAL DE";

    @Autowired
    private RegionalRepository regionalRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void sincronizarAoIniciar() {
        logger.info("Iniciando sincronização de regionais ao iniciar a aplicação...");
        sincronizarRegionais();
    }

    @Scheduled(fixedRate = 600000) // 10 minutos = 600.000 ms
    public void sincronizarPeriodicamente() {
        logger.info("Iniciando sincronização periódica de regionais...");
        sincronizarRegionais();
    }

    private void sincronizarRegionais() {
        try {
            // 1. Buscar regionais da API externa
            ResponseEntity<List<RegionalExternaDTO>> response = restTemplate.exchange(
                    API_URL, HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<RegionalExternaDTO>>() {}
            );

            List<RegionalExternaDTO> regionaisAPI = response.getBody();
            if (regionaisAPI == null) return;

            // 2. Filtrar apenas as que começam com "REGIONAL DE"
            List<RegionalExternaDTO> regionaisFiltradas = regionaisAPI.stream()
                    .filter(r -> r.nome() != null && r.nome().startsWith(FILTRO_NOME))
                    .collect(Collectors.toList());

            logger.info("Encontradas {} regionais para sincronizar", regionaisFiltradas.size());

            // 3. Para cada regional filtrada, verificar se já existe e adicionar se não existir
            for (RegionalExternaDTO regionalAPI : regionaisFiltradas) {
                Regional regionalExistente = regionalRepository.findByNome(regionalAPI.nome());

                if (regionalExistente == null) {
                    Regional novaRegional = new Regional();
                    novaRegional.setNome(regionalAPI.nome());
                    regionalRepository.save(novaRegional);
                    logger.info("Nova regional adicionada: {}", regionalAPI.nome());
                }
            }

            logger.info("Sincronização concluída!");

        } catch (Exception e) {
            logger.error("Erro ao sincronizar regionais: {}", e.getMessage(), e);
        }
    }
}
