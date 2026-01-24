package com.pet.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet.api.domain.auth.dto.AuthenticationDTO;
import com.pet.api.domain.auth.dto.RegisterDTO;
import com.pet.api.domain.auth.model.User;
import com.pet.api.domain.auth.model.enums.UserRole;
import com.pet.api.domain.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("Testes de Autenticação")
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String REGISTER_URL = "/v1/auth/register";
    private static final String LOGIN_URL = "/v1/auth/login";
    private static final String USERNAME = "testuser";
    private static final String PASSWORD = "senha123";

    @BeforeEach
    void limparDados() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Deve registrar um novo usuário com sucesso")
    void deveRegistrarUsuarioComSucesso() throws Exception {
        RegisterDTO registerDTO = new RegisterDTO(USERNAME, PASSWORD, UserRole.USER);

        mockMvc.perform(post(REGISTER_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve falhar ao registrar usuário duplicado")
    void deveFalharAoRegistrarUsuarioDuplicado() throws Exception {
        User usuarioExistente = new User(USERNAME, passwordEncoder.encode(PASSWORD), UserRole.USER);
        userRepository.save(usuarioExistente);

        RegisterDTO registerDTO = new RegisterDTO(USERNAME, PASSWORD, UserRole.USER);

        mockMvc.perform(post(REGISTER_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve fazer login com credenciais corretas")
    void deveFazerLoginComSucesso() throws Exception {
        User user = new User(USERNAME, passwordEncoder.encode(PASSWORD), UserRole.USER);
        userRepository.save(user);

        AuthenticationDTO authDTO = new AuthenticationDTO(USERNAME, PASSWORD);

        mockMvc.perform(post(LOGIN_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    @DisplayName("Deve falhar ao fazer login com senha incorreta")
    void deveFalharLoginComSenhaIncorreta() throws Exception {
        User user = new User(USERNAME, passwordEncoder.encode(PASSWORD), UserRole.USER);
        userRepository.save(user);

        AuthenticationDTO authDTO = new AuthenticationDTO(USERNAME, "senhaErrada");

        mockMvc.perform(post(LOGIN_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve falhar ao fazer login com usuário inexistente")
    void deveFalharLoginComUsuarioInexistente() throws Exception {
        AuthenticationDTO authDTO = new AuthenticationDTO("usuarioInexistente", PASSWORD);

        mockMvc.perform(post(LOGIN_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authDTO)))
                .andExpect(status().isUnauthorized());
    }
}
