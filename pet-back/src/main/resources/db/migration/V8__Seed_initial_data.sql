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
    ('Guns N'' Roses', NOW()),
    ('Eminem', NOW()),
    ('Taylor Swift', NOW()),
    ('Linkin Park', NOW()),
    ('Adele', NOW()),
    ('Coldplay', NOW()),
    ('Bruno Mars', NOW());


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
    ('Greatest Hits', 4, 1, NOW()),

    ('Infinite', 5, 1, NOW()),
    ('The Slim Shady LP', 5, 1, NOW()),
    ('The Marshall Mathers LP', 5, 1, NOW()),
    ('The Eminem Show', 5, 1, NOW()),
    ('Encore', 5, 1, NOW()),
    ('Relapse', 5, 1, NOW()),
    ('Recovery', 5, 1, NOW()),
    ('The Marshall Mathers LP 2', 5, 1, NOW()),
    ('Revival', 5, 1, NOW()),
    ('Music to Be Murdered By', 5, 1, NOW()),

    ('Taylor Swift', 6, 1, NOW()),
    ('Fearless', 6, 1, NOW()),
    ('Speak Now', 6, 1, NOW()),
    ('Red', 6, 1, NOW()),
    ('1989', 6, 1, NOW()),
    ('Reputation', 6, 1, NOW()),
    ('Lover', 6, 1, NOW()),
    ('Folklore', 6, 1, NOW()),
    ('Evermore', 6, 1, NOW()),
    ('Midnights', 6, 1, NOW()),

    ('Hybrid Theory', 7, 1, NOW()),
    ('Meteora', 7, 1, NOW()),
    ('Minutes to Midnight', 7, 1, NOW()),

    ('19', 8, 1, NOW()),
    ('21', 8, 1, NOW()),
    ('25', 8, 1, NOW()),

    ('Parachutes', 9, 1, NOW()),
    ('A Rush of Blood to the Head', 9, 1, NOW()),
    ('Viva la Vida or Death and All His Friends', 9, 1, NOW()),

    ('Doo-Wops & Hooligans', 10, 1, NOW()),
    ('Unorthodox Jukebox', 10, 1, NOW()),
    ('24K Magic', 10, 1, NOW());
