CREATE TABLE tb_artista (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(200) NOT NULL,
    image_key   VARCHAR(500),
    image_url   VARCHAR(1000),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP
);
