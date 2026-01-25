CREATE TABLE tb_refresh_token (
    id          UUID PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    token       VARCHAR(255) UNIQUE NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES tb_users(id) ON DELETE CASCADE
);
