package com.pet.api.domain.regional.service;

import com.pet.api.domain.regional.dto.RegionalExternalDTO;
import com.pet.api.domain.regional.model.Regional;
import com.pet.api.domain.regional.repository.RegionalRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RegionalSyncService {

    private static final Logger logger = LoggerFactory.getLogger(RegionalSyncService.class);
    private static final String API_URL = "https://integrador-argus-api.geia.vip/v1/regionais";
    private static final String NOME_PREFIXO = "REGIONAL DE";

    private final RegionalRepository regionalRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public RegionalSyncService(RegionalRepository regionalRepository) {
        this.regionalRepository = regionalRepository;
    }

    @PostConstruct
    public void sincronizarAoIniciar() {
        logger.info("Iniciando sincronização de regionais ao iniciar a aplicação...");
        sincronizarRegionais();
    }

    @Scheduled(fixedRate = 600000)
    public void sincronizarPeriodicamente() {
        logger.info("Iniciando sincronização periódica de regionais...");
        sincronizarRegionais();
    }

    private void sincronizarRegionais() {
        try {
            ResponseEntity<List<RegionalExternalDTO>> response = restTemplate.exchange(
                    API_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<RegionalExternalDTO>>() {}
            );

            List<RegionalExternalDTO> regionaisAPI = response.getBody();
            if (regionaisAPI == null) {
                return;
            }

            List<RegionalExternalDTO> regionaisFiltradas = regionaisAPI.stream()
                    .filter(r -> r.nome() != null && r.nome().startsWith(NOME_PREFIXO))
                    .collect(Collectors.toList());

            logger.info("Encontradas {} regionais na API", regionaisFiltradas.size());

            List<Regional> regionaisAtivasNoBanco = regionalRepository.findByAtivo(true);

            Set<String> nomesNaAPI = regionaisFiltradas.stream()
                    .map(RegionalExternalDTO::nome)
                    .collect(Collectors.toSet());

            Set<String> nomesAtivosNoBanco = regionaisAtivasNoBanco.stream()
                    .map(Regional::getNome)
                    .collect(Collectors.toSet());

            for (RegionalExternalDTO regionalAPI : regionaisFiltradas) {
                if (!nomesAtivosNoBanco.contains(regionalAPI.nome())) {
                    Regional regionalInativa = regionalRepository.findByNomeAndAtivo(regionalAPI.nome(), false);
                    if (regionalInativa != null) {
                        regionalInativa.setAtivo(true);
                        regionalRepository.save(regionalInativa);
                        logger.info("Regional reativada: {}", regionalAPI.nome());
                    } else {
                        Regional novaRegional = new Regional();
                        novaRegional.setNome(regionalAPI.nome());
                        novaRegional.setAtivo(true);
                        regionalRepository.save(novaRegional);
                        logger.info("Nova regional adicionada: {}", regionalAPI.nome());
                    }
                }
            }

            for (Regional regionalBanco : regionaisAtivasNoBanco) {
                if (!nomesNaAPI.contains(regionalBanco.getNome())) {
                    regionalBanco.setAtivo(false);
                    regionalRepository.save(regionalBanco);
                    logger.info("Regional inativada (ausente na API): {}", regionalBanco.getNome());
                }
            }

            logger.info("Sincronização concluída!");

        } catch (Exception e) {
            logger.error("Erro ao sincronizar regionais: {}", e.getMessage(), e);
        }
    }
}
