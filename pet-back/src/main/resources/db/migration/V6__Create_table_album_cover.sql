CREATE TABLE tb_capa_album (
    id          BIGSERIAL PRIMARY KEY,
    album_id    BIGINT NOT NULL,
    object_key  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (album_id) REFERENCES tb_album(id) ON DELETE CASCADE
);
