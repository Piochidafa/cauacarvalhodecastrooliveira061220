package com.pet.api.controller;

import com.pet.api.config.security.TokenService;
import com.pet.api.dto.*;
import com.pet.api.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import com.pet.api.model.RefreshToken;
import com.pet.api.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.pet.api.repository.UserRepository;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDTO> login(@RequestBody @Valid AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.username(), data.password());
        Authentication auth = authenticationManager.authenticate(usernamePassword);
        
        User user = (User) auth.getPrincipal();
        String accessToken = tokenService.generateToken(user);
        String refreshToken = refreshTokenService.generateRefreshToken(user);
        
        return ResponseEntity.ok(new AuthenticationResponseDTO(accessToken, refreshToken, 300L));
    }


//    @PostMapping("/refresh")
//    public ResponseEntity<RefreshTokenResponseDTO> refresh(@RequestBody @Valid RefreshTokenDTO data) {
//        RefreshToken username = refreshTokenService.validateRefreshToken(data.refreshToken());
//
//        if (username == null) {
//            return ResponseEntity.status(401).build();
//        }
//
//
//        User user = userRepository.findUserByUsername(username.getUser().getUsername());
//        if (user == null) {
//            return ResponseEntity.status(401).build();
//        }
//
//        String accessToken = tokenService.generateToken(user);
//        String refreshToken = refreshTokenService.generateRefreshToken(user);
//
//        return ResponseEntity.ok(new RefreshTokenResponseDTO(accessToken, refreshToken, 300L));
//    }


    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponseDTO> refresh(
            @CookieValue("refreshToken") String refreshTokenValue,
            HttpServletResponse response
    ) {
        RefreshToken storedToken =
                refreshTokenService.validateRefreshToken(refreshTokenValue);

        User user = storedToken.getUser();
        
        refreshTokenService.revoke(storedToken);
        String newRefreshToken =
                refreshTokenService.generateRefreshToken(user);

        String accessToken = tokenService.generateToken(user);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(
                new RefreshTokenResponseDTO(accessToken, 300L)
        );
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


