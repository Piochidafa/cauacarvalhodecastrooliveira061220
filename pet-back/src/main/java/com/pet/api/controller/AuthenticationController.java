package com.pet.api.controller;

import com.pet.api.config.security.TokenService;
import com.pet.api.dto.AuthenticationDTO;
import com.pet.api.dto.AuthenticationResponseDTO;
import com.pet.api.dto.RefreshTokenDTO;
import com.pet.api.dto.RegisterDTO;
import jakarta.validation.Valid;

import com.pet.api.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.pet.api.repository.UserRepository;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDTO> login(@RequestBody @Valid AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.username(), data.password());
        Authentication auth = authenticationManager.authenticate(usernamePassword);
        
        User user = (User) auth.getPrincipal();
        String accessToken = tokenService.generateToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);
        
        return ResponseEntity.ok(new AuthenticationResponseDTO(accessToken, refreshToken, 300L));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponseDTO> refresh(@RequestBody @Valid RefreshTokenDTO data) {
        String username = tokenService.validateRefreshToken(data.refreshToken());
        
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        
        User user = userRepository.findUserByUsername(username);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        String accessToken = tokenService.generateToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);
        
        return ResponseEntity.ok(new AuthenticationResponseDTO(accessToken, refreshToken, 300L));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid RegisterDTO data) {
        if (userRepository.findByUsername(data.username()) != null) {
            return ResponseEntity.badRequest().body("Username ja em uso!");
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());
        User newUser = new User(data.username(), encryptedPassword, data.role());

        userRepository.save(newUser);

        return ResponseEntity.ok().build();
    }
}


