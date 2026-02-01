package com.pet.api.domain.auth.service;

import com.pet.api.domain.auth.model.RefreshToken;
import com.pet.api.domain.auth.model.User;
import com.pet.api.domain.auth.model.enums.UserRole;
import com.pet.api.domain.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository repository;

    @InjectMocks
    private RefreshTokenService service;

    @Test
    void generateRefreshTokenPersistsToken() {
        User user = new User("user", "pass", UserRole.USER);
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);

        String token = service.generateRefreshToken(user);

        assertNotNull(token);
        verify(repository).save(captor.capture());
        RefreshToken saved = captor.getValue();
        assertEquals(user, saved.getUser());
        assertFalse(saved.isRevoked());
        assertTrue(saved.getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void validateRefreshTokenReturnsTokenWhenValid() {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("t");
        refreshToken.setExpiresAt(Instant.now().plusSeconds(60));
        refreshToken.setRevoked(false);

        when(repository.findByTokenAndRevokedFalse("t")).thenReturn(Optional.of(refreshToken));

        RefreshToken result = service.validateRefreshToken("t");
        assertEquals(refreshToken, result);
    }

    @Test
    void validateRefreshTokenThrowsWhenExpired() {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("t");
        refreshToken.setExpiresAt(Instant.now().minusSeconds(10));
        refreshToken.setRevoked(false);

        when(repository.findByTokenAndRevokedFalse("t")).thenReturn(Optional.of(refreshToken));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.validateRefreshToken("t"));
        assertEquals("Refresh token expirado", ex.getMessage());
        assertTrue(refreshToken.isRevoked());
        verify(repository).save(refreshToken);
    }

    @Test
    void revokeMarksTokenAsRevoked() {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setRevoked(false);

        service.revoke(refreshToken);

        assertTrue(refreshToken.isRevoked());
        verify(repository).save(refreshToken);
    }
}
