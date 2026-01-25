-- Seed: Usuário de teste
-- Senha: bambam (BCrypt hash)
INSERT INTO tb_users (username, password, role) 
VALUES ('cleber', '$2a$10$sw.5DBECiZjXgmHGe6ahquByAiqP5YgsqnWI/3HYRNzbEoHXVqgd6', 'ADMIN');

-- Seed: Regionais
INSERT INTO tb_regional (nome, ativo) VALUES
    ('REGIONAL DE CUIABÁ', true),
    ('REGIONAL DE GUARANTÃ DO NORTE', true),
    ('REGIONAL DE VILA RICA', true);

-- Seed: Artistas
INSERT INTO tb_artista (nome, created_at) VALUES
    ('Caetano Veloso', NOW()),
    ('Gilberto Gil', NOW()),
    ('Chico Buarque', NOW()),
    ('Maria Bethânia', NOW()),
    ('Elis Regina', NOW()),
    ('Tom Jobim', NOW()),
    ('Vinícius de Moraes', NOW()),
    ('Milton Nascimento', NOW());

-- Seed: Álbuns
INSERT INTO tb_album (nome, artista_id, regional_id, created_at) VALUES
    ('Robson', 1, 1, NOW()),
    ('Estrangeiro', 1, 1, NOW()),
    ('Expresso 2222', 2, 1, NOW()),
    ('Refavela', 2, 1, NOW()),
    ('Construção', 3, 1, NOW()),
    ('Ópera do Malandro', 3, 1, NOW()),
    ('Álibi', 4, 1, NOW()),
    ('Drama', 4, 1, NOW()),
    ('Elis & Tom', 5, 1, NOW()),
    ('Falso Brilhante', 5, 1, NOW()),
    ('Wave', 6, 1, NOW()),
    ('Matita Perê', 6, 1, NOW()),
    ('Arca de Noé', 7, 1, NOW()),
    ('Clube da Esquina', 8, 1, NOW()),
    ('Geraes', 8, 1, NOW());
