# Projeto Seletivo - API Pet + Front

## Dados da Inscricao
- Nome: Caua Carvalho de Castro Oliveira
- Email: cauacastrooliveira@gmail.com
- Vaga: Engenheiro da Computacao - Senior

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

## Como executar (Docker)
1) Subir os containers:
```
docker compose up --build
```

2) Acessos:
- Front: http://localhost:5173
- API: http://localhost:8083
- MinIO Console: http://localhost:9001
- Health (API): http://localhost:8083/actuator/health

## Como executar (Local sem Docker)
### Back-end
```
cd pet-back
./mvnw spring-boot:run
```

### Front-end
```
cd pet-front
npm install
npm run dev
```

## Como testar
### Back-end
```
cd pet-back
./mvnw test
```

### Front-end
```
cd pet-front
npm test
```

## Variaveis de Ambiente (Docker)
- API:
  - `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/petDB`
  - `SPRING_DATASOURCE_USERNAME=petDB`
  - `SPRING_DATASOURCE_PASSWORD=...`
  - `MINIO_ENDPOINT=http://minio:9000`
  - `MINIO_ACCESS_KEY=minioadmin`
  - `MINIO_SECRET_KEY=minioadmin123`
- Front (build):
  - `VITE_API_URL=http://localhost:8083`

## Estrutura de Dados (Resumo)
- **artista**: id (PK), nome (varchar), image_key (varchar), image_url (varchar)
- **album**: id (PK), nome (varchar), artista_id (FK), regional_id (FK)
- **album_cover**: id (PK), album_id (FK), object_key (varchar), url (varchar)
- **regional**: id (PK), nome (varchar), ativo (boolean)
- **users**: id (PK), username, password, role
- **refresh_token**: id (PK), user_id (FK), token, expires_at, revoked

## Requisitos (Mapa de Atendimento)
### Back-end
- CORS (origens permitidas): implementado
- JWT com expiracao de 5 min e renovacao: implementado
- Verbos GET/POST/PUT: implementado
- Paginacao de albuns: implementado
- Consultas parametrizadas de albuns por artista: implementado
- Busca por nome de artista + ordenacao: implementado
- Upload de uma ou mais capas: implementado
- Armazenamento em MinIO: implementado
- Presigned URL com expiracao 30 min: implementado
- Versionamento de endpoints: implementado
- Flyway migrations: implementado
- OpenAPI/Swagger: implementado

### Front-end
- Listagem de artistas com busca/ordenacao/paginacao: implementado
- Detalhe do artista + albuns + capas + vazio: implementado
- Cadastro/edicao de artista e album + upload de capas: implementado
- Autenticacao JWT e renovacao: implementado
- Arquitetura com services/facade + BehaviorSubject: implementado
- Layout responsivo: implementado
- TypeScript: implementado

### Senior
- Health Checks/Liveness/Readiness: implementado (actuator)
- Testes unitarios: implementado
- WebSocket notifica novo album: implementado
- Rate limit (10 req/min): implementado
- Facade + BehaviorSubject no front: implementado
- Sincronizacao regionais (endpoint externo): implementado

## Observacoes
- O front e servido via Nginx no container.
- O Vite usa `VITE_API_URL` em build time.
- Imagens ficam persistidas em `./minio-data`.
- Banco persiste em `./postgres-data`.

