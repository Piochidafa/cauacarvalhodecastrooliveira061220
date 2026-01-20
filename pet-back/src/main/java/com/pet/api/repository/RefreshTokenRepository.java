package com.pet.api.repository;

import com.pet.api.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.rmi.server.UID;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UID> {

    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

}
