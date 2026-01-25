CREATE TABLE tb_regional (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(200) NOT NULL,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE
);