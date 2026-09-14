# 🏆 InterEng Alagoas

> PWA do campeonato inter-atléticas de engenharia do estado de Alagoas (vôlei, basquete, futsal e handebol). Sorteio de grupos com revelação animada, tabela de classificação calculada na hora, agenda pública e comunidade — tudo numa área só pra diretoria administrar.

---

## 🚀 O que tem aqui

- **Sorteio ao vivo:** as cabeças de grupo aparecem na hora, os times seguintes entram um a um a cada 3 segundos — pensado pra rodar na live do Instagram do evento sem entregar o resultado de uma vez.
- **Tabela sempre atual:** classificação (pontos, saldo, confrontos) é derivada dos jogos registrados a cada acesso — não existe uma cópia salva que possa ficar desatualizada.
- **Jogos de grupo em um clique:** gera automaticamente todos os confrontos round-robin de cada grupo; a diretoria só entra em cada um pra definir ginásio e horário (idempotente — pode rodar de novo sem duplicar).
- **Agenda pública:** qualquer visitante vê os jogos e horários sem precisar de login.
- **Comunidade:** mural da torcida com posts, curtidas e comentários — inclusive comentando direto num jogo da agenda.
- **Login unificado:** uma única conta serve pra torcida comentar e pra diretoria administrar; o campo `role` decide quem entra no `/admin`.
- **PWA com a identidade oficial do evento:** logo, paleta e fonte oficiais aplicadas; instalável, com shell offline-first via service worker.

---

## 🎨 Sistema de design

Tokens em [`src/app/globals.css`](src/app/globals.css), sob `@theme` do Tailwind v4.

| Papel | Valor |
| --- | --- |
| Fundo | `#040b2b` |
| Superfície | `#00106a` |
| Laranja (destaque) | `#e88e34` |
| Bronze | `#b5650d` |
| Texto | `#e5e5e5` |

Tipografia: **Oswald** nos títulos, **Inter** no corpo, **Caesar Dressing** no wordmark/hero (fonte oficial do evento, tema espartano/gladiador).

### Marca — InterEng Alagoas

Brasão oficial do evento (capacete espartano), fornecido pela organização.

| Arquivo | Uso |
| --- | --- |
| [`public/brand/logo.png`](public/brand/logo.png) | Logo colorida (cabeçalho, hero da home) |
| [`public/brand/logo-mono.png`](public/brand/logo-mono.png) | Versão em linha única |
| [`public/icons/icon.svg`](public/icons/icon.svg) | Favicon escalável |
| [`public/manifest.webmanifest`](public/manifest.webmanifest) | Ícones do PWA (192, 512, maskable) |

---

## 💻 Stack

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

- **Next.js 16** (App Router, Turbopack) · **React 19**
- **Tailwind CSS 4** — tokens via `@theme`, sem arquivo de config
- **Prisma 7** + `@prisma/adapter-pg` — Postgres (Supabase em produção, Docker localmente)
- **jose** + **bcryptjs** — sessão JWT em cookie, sem NextAuth
- **zod** — validação de formulários e payloads de API
- **sharp** — geração dos ícones do PWA a partir do brasão oficial

---

## 📁 Estrutura

```
src/
  app/            # rotas (App Router): público, /admin, /api
  components/     # UI por domínio (admin, agenda, comunidade, nav...)
  lib/            # auth, sorteio, standings, datetime, schemas
  fonts/          # Caesar Dressing (licença OFL, ver src/fonts/OFL.txt)
prisma/
  schema.prisma
  migrations/
public/
  brand/          # logo oficial
  icons/          # ícones do PWA
  textures/       # textura de fundo
```

---

## ⚙️ Rodando localmente

**Pré-requisitos:** [Node.js](https://nodejs.org/en/) 20+ e [Docker](https://www.docker.com/) (Postgres local).

```bash
git clone https://github.com/usrJosephC/intereng-alagoas-pwa.git
cd intereng-alagoas-pwa
cp .env.example .env
npm install
```

```bash
docker-compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

Acesse [`http://localhost:3000`](http://localhost:3000). O Postgres local sobe na porta `5433` (evita colidir com outros projetos na `5432`).

---

## 🔐 Acesso da diretoria

O seed (`npm run db:seed`) cria a conta da diretoria com as credenciais de `SEED_ADMIN_NAME` / `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` do `.env`. Com essa conta é possível entrar em `/admin/login` e gerenciar atléticas, locais, sorteio, jogos e moderação da comunidade.

---

## 📄 Licença

Projeto do evento InterEng Alagoas — sem licença de código aberto definida.

Feito com ❤️ por **Joseph Cavalcante**.
