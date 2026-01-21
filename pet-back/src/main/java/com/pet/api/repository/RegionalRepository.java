package com.pet.api.repository;

import com.pet.api.model.Regional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegionalRepository extends JpaRepository<Regional, Long> {
    Regional findByNome(String nome);
}
