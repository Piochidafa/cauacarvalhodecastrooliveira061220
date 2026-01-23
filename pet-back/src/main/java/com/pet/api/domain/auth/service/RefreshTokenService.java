package com.pet.api.domain.auth.service;

import com.pet.api.domain.auth.model.RefreshToken;
import com.pet.api.domain.auth.model.User;
import com.pet.api.domain.auth.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final long EXPIRATION_DAYS = 7;

    private final RefreshTokenRepository repository;

    public RefreshTokenService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    public String generateRefreshToken(User user) {
        String token = UUID.randomUUID().toString();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(token);
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(
                Instant.now().plus(EXPIRATION_DAYS, ChronoUnit.DAYS)
        );
        refreshToken.setRevoked(false);

        repository.save(refreshToken);
        return token;
    }

    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = repository
                .findByTokenAndRevokedFalse(token)
                .orElseThrow(() ->
                        new RuntimeException("Refresh token inválido"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            repository.save(refreshToken);
            throw new RuntimeException("Refresh token expirado");
        }

        return refreshToken;
    }

    public void revoke(RefreshToken token) {
        token.setRevoked(true);
        repository.save(token);
    }
}
