CREATE TABLE tb_capa_album (
    id           BIGSERIAL PRIMARY KEY,
    album_id     BIGSERIAL NOT NULL,
    object_key   VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);
