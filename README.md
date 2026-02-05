# Projeto Seletivo - API Pet(Portal de Entretenimento e Talento) + Front

## Dados da Inscricao
- Nome: Caua Carvalho de Castro Oliveira
- Email: cauacastrooliveira@gmail.com
- Vaga: Engenheiro da Computacao - Senior
- Inscrição: **16329**

## Arquitetura (Resumo)
- **Back-end**: Spring Boot (Java), JWT, Flyway, MinIO (S3), PostgreSQL.
- **Front-end**: React + TypeScript (Vite), PrimeReact, autenticacao JWT.
- **Storage**: MinIO para imagens de capas.
- **Infra**: docker-compose com API, Front, Postgres e MinIO.

### Componentes
- API: `pet-back`
- Front: `pet-front`
- Banco: Postgres
- Storage: MinIO

### Arquitetura do Back-end (Detalhada)
- **Organizacao por dominios**: artista, album, banda, regional, auth.
- **Camadas por dominio**: controller, service, repository, dto e model.
- **Persistencia**: Spring Data JPA com Postgres.
- **Migracoes**: Flyway para versionamento do schema.
- **Seguranca**: JWT com endpoints de auth e refresh.
- **Storage**: MinIO (S3) para imagens de artista e capas de album.
- **Health**: Actuator para health check.

**Por que essa arquitetura?**
- **Manutenibilidade**: alteracoes em um dominio nao impactam os demais.
- **Escalabilidade**: adiciona novas funcionalidades sem acoplamento entre modulos.
- **Testabilidade**: services e repositories podem ser testados isoladamente.
- **Clareza de fluxo**: dados fluem de entrada (DTO) -> regra de negocio (Service) -> persistencia (Repository).
- **Confiabilidade de schema**: Flyway evita drift entre ambientes.
- **Blob storage dedicado**: MinIO evita sobrecarregar o banco com arquivos e simplifica cache e URLs.

### Arquitetura do Front-end (Detalhada)
- **Organizacao por paginas, componentes e servicos**.
- **Consumo de API centralizado**: chamadas HTTP ficam na camada de servicos.
- **Vite + React + TypeScript**: build rapido, tipagem forte e bom DX.
- **Roteamento**: React Router para navegacao e protecao de rotas.
- **UI Kit**: PrimeReact para acelerar interfaces consistentes.
- **Estado**: estado local e hooks para fluxo de dados por pagina.

**Por que essa arquitetura?**
- **Evolucao da UI**: paginas e componentes isolados facilitam manutencao e refatoracao.
- **Organizacao**: servicos evitam acoplamento direto das telas com HTTP.
- **Produtividade**: Vite acelera ciclo de desenvolvimento.
- **Qualidade**: TypeScript reduz bugs de contrato.


### Testes Sem Node/Java instalados (somente Docker)
#### Back-end
Use o comando abaixo conforme seu shell:
- **Linux/macOS (bash/zsh)**:
```
docker run --rm -v "$(pwd):/app" -w /app/pet-back maven:3.9-eclipse-temurin-21 mvn test
```
- **Windows PowerShell**:
```
docker run --rm -v "${PWD}:/app" -w /app/pet-back maven:3.9-eclipse-temurin-21 mvn test
```
- **Windows CMD**:
```
docker run --rm -v "%cd%:/app" -w /app/pet-back maven:3.9-eclipse-temurin-21 mvn test
```

#### Front-end
Use o comando abaixo conforme seu shell:
- **Linux/macOS (bash/zsh)**:
```
docker run --rm -v "$(pwd):/app" -w /app/pet-front node:20 bash -lc "npm ci && npm test"
```
- **Windows PowerShell**:
```
docker run --rm -v "${PWD}:/app" -w /app/pet-front node:20 bash -lc "npm ci && npm test"
```
- **Windows CMD**:
```
docker run --rm -v "%cd%:/app" -w /app/pet-front node:20 bash -lc "npm ci && npm test"
```



## Como executar (Docker)
1) Subir os containers:
```
docker compose up --build
```

2) Acessos:
- Front: http://localhost:5173
- API: http://localhost:8083
- MinIO Console: http://localhost:9001
- - Usuario: minioadmin
- - Senha: minioadmin123
- Health (API): http://localhost:8083/actuator/health


## Passo a passo (Fluxos das telas)
### 1) Login (Autenticação)
1. Acesse o Front em http://localhost:5173
2. Faça login com:
   - Usuário: `admin`
   - Senha: `admin`
3. Após login, o app carrega a tela inicial (lista de artistas).

### 2) Tela Inicial - Listagem de Artistas
1. Verifique a lista de artistas em cards (nome e nº de álbuns).
2. Use a busca por nome no campo de pesquisa.
3. Teste ordenação asc/desc.
4. Navegue entre páginas (paginação).

### 3) Tela de Detalhamento do Artista
1. Clique em um artista na lista.
2. Valide a exibição dos álbuns associados e suas capas.
3. Se não houver álbuns, confira a mensagem de vazio.

### 4) Cadastro/Edição de Artista
1. Na lista de artistas, clique em "Novo Artista".
2. Preencha o formulário e salve.
3. Para editar, clique no artista e use a ação de edição(botao na parte superior direita da tela na tela de listagem de albuns).
4. Faça upload/remoção de imagem do artista quando aplicável.

### 5) Cadastro/Edição de Álbum + Upload de Capas
1. Dentro do detalhe do artista, clique em "Adicionar Álbum".
2. Preencha o formulário com nome e regional.
3. Faça upload de uma ou mais capas (MinIO).
4. Salve e confirme o álbum listado com as capas.
5. Edite um álbum existente e confira a atualização.

### 6) Expiração/Renovação de Token
1. Aguarde o Access Token quase expirar (4 minutos).
2. Ira aparecer um toast perguntando se deseja renovar a sessao.
3. O refresh é acionado manualmente via um botao no toast.



## Estrutura de Dados (Detalhada)
| Tabela | Campos principais | Por que existe |
| --- | --- | --- |
| **tb_artista** | `id` (PK), `nome` (varchar), `image_key` (varchar), `image_url` (varchar), `created_at`, `updated_at` | Nucleo do dominio. `nome` suporta busca/ordenacao. `image_key` guarda o objeto no MinIO e `image_url` evita recalculo de presigned em cada consulta. |
| **tb_album** | `id` (PK), `nome` (varchar), `artista_id` (FK), `regional_id` (FK), `created_at`, `updated_at` | Album pertence a artista e regional. FKs garantem integridade e permitem filtros. `nome` e usado para busca/ordenacao. |
| **tb_capa_album** | `id` (PK), `album_id` (FK), `object_key` (varchar), `created_at` | Um album pode ter varias capas. `object_key` aponta para o MinIO e as URLs sao resolvidas no backend quando necessario. |
| **tb_regional** | `id` (PK), `nome` (varchar), `ativo` (boolean) | Sincronizacao externa. `ativo` permite inativar sem perder historico. |
| **tb_users** | `id` (PK), `username`, `password`, `role` | Base de autenticacao/autorizacao. `role` permite separacao de permissoes. |
| **tb_refresh_token** | `id` (PK UUID), `user_id` (FK), `token`, `expires_at`, `revoked` | Renovacao segura de sessao. `expires_at` define validade e `revoked` invalida tokens comprometidos. |

**Relacao entre tabelas**
- `tb_album.artista_id` -> `tb_artista.id` (N:1, ON DELETE CASCADE)
- `tb_album.regional_id` -> `tb_regional.id` (N:1, ON DELETE RESTRICT)
- `tb_capa_album.album_id` -> `tb_album.id` (N:1, ON DELETE CASCADE)
- `tb_refresh_token.user_id` -> `tb_users.id` (N:1, ON DELETE CASCADE)

## Mapeamento de Endpoints (por domínio)
### Auth (`/v1/auth`)
- `POST /v1/auth/login` — autentica usuário e retorna `accessToken` + `refreshToken`.
- `POST /v1/auth/refresh` — renova o access token usando o cookie `refreshToken`.
- `POST /v1/auth/register` — registra novo usuário.

### Artistas (`/v1/artista`)
- `GET /v1/artista` — lista artistas paginados.
- `GET /v1/artista/buscar?nome=` — busca artistas por nome (paginado).
- `POST /v1/artista/create` — cria um artista.
- `GET /v1/artista/{id}` — obtém artista por ID (com álbuns e capas).
- `GET /v1/artista/{id}/detail?nome=` — detalhe do artista com álbuns paginados (filtro opcional por nome).
- `PUT /v1/artista/{id}` — atualiza artista.
- `POST /v1/artista/{id}/image` — upload de imagem do artista (multipart).
- `DELETE /v1/artista/{id}/image` — remove imagem do artista.
- `DELETE /v1/artista/{id}` — remove artista.

### Álbuns (`/v1/album`)
- `GET /v1/album` — lista álbuns paginados.
- `POST /v1/album` — cria álbum.
- `POST /v1/album/with-cover` — cria álbum com capa (multipart).
- `GET /v1/album/{id}` — obtém álbum por ID.
- `PUT /v1/album/{id}` — atualiza álbum.
- `PUT /v1/album/{id}/with-cover` — atualiza álbum com capa (multipart).
- `DELETE /v1/album/{id}` — remove álbum.
- `GET /v1/album/artista/{artistaId}` — lista álbuns de um artista (paginado).
- `GET /v1/album/buscar?nomeArtista=` — busca álbuns pelo nome do artista (paginado).
- `GET /v1/album/buscar-por-artista?nome=&artistaId=` — busca álbuns por nome filtrando por artista (paginado).

### Capas de Álbum (`/v1/album-cover`)
- `GET /v1/album-cover` — lista capas paginadas.
- `POST /v1/album-cover/upload` — upload de capa (multipart).
- `POST /v1/album-cover/upload-multiple` — upload de múltiplas capas (multipart).
- `GET /v1/album-cover/{id}` — obtém capa por ID.
- `PUT /v1/album-cover/{id}` — atualiza dados da capa.
- `GET /v1/album-cover/{id}/download` — baixa arquivo da capa.
- `GET /v1/album-cover/{id}/url` — obtém URL da capa.
- `GET /v1/album-cover/album/{albumId}` — lista capas de um álbum.
- `DELETE /v1/album-cover/{id}` — remove capa.

### Regionais (`/v1/regional`)
- `GET /v1/regional` — lista regionais paginadas.
- `POST /v1/regional/create` — cria regional.
- `GET /v1/regional/{id}` — obtém regional por ID.
- `PUT /v1/regional/{id}` — atualiza regional.
- `DELETE /v1/regional/{id}` — remove regional.
