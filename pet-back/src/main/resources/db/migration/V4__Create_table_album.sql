CREATE TABLE tb_album (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(200) NOT NULL,
    regional    VARCHAR(200) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP
);
