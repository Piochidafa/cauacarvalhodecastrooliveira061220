package com.pet.api.shared.config.security;

import com.pet.api.domain.auth.model.User;
import com.pet.api.domain.auth.model.enums.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class TokenServiceTest {

    @Test
    void generateAndValidateTokenHappyPath() {
        TokenService tokenService = new TokenService();
        ReflectionTestUtils.setField(tokenService, "secret", "test-secret");

        User user = new User("user", "pass", UserRole.USER);
        String token = tokenService.generateToken(user);

        assertNotNull(token);
        String subject = tokenService.validateToken(token);
        assertEquals("user", subject);
    }

    @Test
    void validateTokenReturnsNullOnInvalidToken() {
        TokenService tokenService = new TokenService();
        ReflectionTestUtils.setField(tokenService, "secret", "test-secret");

        String subject = tokenService.validateToken("invalid-token");
        assertNull(subject);
    }

    @Test
    void generateTokenUsesUserSubject() {
        TokenService tokenService = new TokenService();
        ReflectionTestUtils.setField(tokenService, "secret", "test-secret");

        User user = new User("other", "pass", UserRole.ADMIN);
        String token = tokenService.generateToken(user);

        assertEquals("other", tokenService.validateToken(token));
    }
}
