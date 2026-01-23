CREATE TABLE tb_album (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(200) NOT NULL,
    regional_id    BIGINT NOT NULL,
    artista_id      BIGINT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP
);
