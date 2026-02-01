-- Seed: Usuário de teste
-- Senha: bambam (BCrypt hash)
INSERT INTO tb_users (username, password, role) 
VALUES ('admin', '$2a$10$MzRR9e/HTyzt0/0tjbzkauK5NEYuths0kQWqug3CMPJIjA.Lq2LE2', 'ADMIN');

-- Seed: Regionais
INSERT INTO tb_regional (nome, ativo) VALUES
    ('REGIONAL DE CUIABÁ', true),
    ('REGIONAL DE GUARANTÃ DO NORTE', true),
    ('REGIONAL DE VILA RICA', true);

-- Seed: Artistas
INSERT INTO tb_artista (nome, created_at) VALUES
    ('Serj Tankian', NOW()),
    ('Mike Shinoda', NOW()),
    ('Michel Teló', NOW()),
    ('Guns N’ Roses', NOW());

-- Seed: Álbuns
INSERT INTO tb_album (nome, artista_id, regional_id, created_at) VALUES
    ('Harakiri', 1, 1, NOW()),
    ('Black Blooms', 1, 1, NOW()),
    ('The Rough Dog', 1, 1, NOW()),

    ('The Rising Tied', 2, 1, NOW()),
    ('Post Traumatic', 2, 1, NOW()),
    ('Post Traumatic EP', 2, 1, NOW()),
    ('Where’d You Go', 2, 1, NOW()),

    ('Bem Sertanejo', 3, 1, NOW()),
    ('Bem Sertanejo - O Show (Ao Vivo)', 3, 1, NOW()),
    ('Bem Sertanejo - (1ª Temporada) - EP', 3, 1, NOW()),

    ('Use Your Illusion I', 4, 1, NOW()),
    ('Use Your Illusion II', 4, 1, NOW()),
    ('Greatest Hits', 4, 1, NOW());
