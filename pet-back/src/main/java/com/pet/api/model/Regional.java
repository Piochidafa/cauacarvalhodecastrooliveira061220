package com.pet.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_regional")
public class Regional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    @Override
    public String toString() {
        return "Regional{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                '}';
    }
}
