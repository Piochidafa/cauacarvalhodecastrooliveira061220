CREATE TABLE refresh_token (
    id          UUID PRIMARY KEY,
    user_id     BIGSERIAL NOT NULL,
    token       VARCHAR(255) UNIQUE NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE
);
