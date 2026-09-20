# 🏆 InterEng Alagoas

> PWA do campeonato inter-atléticas de engenharia do estado de Alagoas (vôlei, basquete, futsal e handebol, cada um em masculino/feminino). Sorteio de grupos com revelação animada, cabeças de chave manuais, tabela e pódio calculados na hora, chaveamento visual do mata-mata, agenda pública e comunidade — tudo numa área administrativa com papéis específicos pra diretoria, organizadores e súmulas.

---

## 🚀 O que tem aqui

- **Sorteio ao vivo:** as cabeças de grupo aparecem na hora, os times seguintes entram um a um a cada 3 segundos — pensado pra rodar na live do Instagram do evento sem entregar o resultado de uma vez.
- **Cabeças de chave manuais:** a diretoria escolhe quem é o cabeça do Grupo A/B (ex: 1º/2º colocados do campeonato anterior); o resto continua sendo sorteado e distribuído de forma equilibrada.
- **Tabela, pódio e chaveamento sempre atuais:** classificação (pontos, saldo, confrontos) é derivada dos jogos a cada acesso; quando a fase de mata-mata termina, um pódio final (1º-4º) aparece automaticamente, e quartas/semi/final ganham um chaveamento visual em colunas.
- **Jogos de grupo em um clique:** gera automaticamente todos os confrontos round-robin de cada grupo, com verificação de choque de horário pra nenhuma atlética jogar dois esportes ao mesmo tempo.
- **Agenda pública:** qualquer visitante vê os jogos, horários e um indicador "ao vivo" pulsante, sem precisar de login.
- **Comunidade:** mural da torcida em grid, com posts, curtidas e comentários — inclusive comentando direto num jogo da agenda.
- **Papéis com escopos diferentes:** MASTER (gerencia todos os usuários e vê o log de auditoria), ADMIN/ORGANIZADOR (times, sorteio, jogos, atléticas, comunidade), SÚMULA (só placar/status/observações dos jogos) e a torcida (MEMBER) — detalhes na seção 🔐 mais abaixo.
- **Conta e privacidade:** recuperação de senha por e-mail, perfil editável pelo próprio usuário (foto, dados de contato) e consentimento de compartilhamento de dados obrigatório e revogável no cadastro.
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
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

- **Next.js 16** (App Router, Turbopack) · **React 19**
- **Tailwind CSS 4** — tokens via `@theme`, sem arquivo de config
- **Prisma 7** + `@prisma/adapter-pg` — Postgres (Supabase em produção, Docker localmente)
- **jose** + **bcryptjs** — sessão JWT em cookie, sem NextAuth
- **zod** — validação de formulários e payloads de API
- **sharp** — geração dos ícones do PWA a partir do brasão oficial
- **exceljs** — exportação da agenda completa de jogos em `.xlsx`
- **resend** — e-mail transacional (recuperação de senha)
- **three.js** + **@react-three/fiber** — campo de partículas no hero da home

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

`RESEND_API_KEY` é opcional: sem ela, o link de recuperação de senha só aparece no log do servidor em vez de ser enviado por e-mail de verdade.

---

## 🔐 Papéis de acesso

O seed (`npm run db:seed`) cria a conta inicial da diretoria (`ADMIN`) com as credenciais de `SEED_ADMIN_NAME` / `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` do `.env`. A partir dela dá pra promover outras contas em **Usuários** (`/admin/usuarios`).

| Papel | O que acessa |
| --- | --- |
| **MASTER** | Tudo do ADMIN, mais criar/editar/excluir qualquer usuário (inclusive outros ADMIN) e o log de auditoria (`/admin/auditoria`) |
| **ADMIN** | Atléticas, locais, sorteio, times, jogos e moderação da comunidade de todos os esportes; promove usuários a ORGANIZADOR/SÚMULA/ADMIN |
| **ORGANIZADOR** | Mesmo acesso do ADMIN ao painel, exceto a tela de Usuários |
| **SÚMULA** | Só a tela `/admin/sumula`: placar, status e observações de qualquer jogo |
| **MEMBER** | Torcida — comenta e publica na comunidade, edita o próprio perfil em `/perfil` |

---

## 📄 Licença

Projeto do evento InterEng Alagoas — sem licença de código aberto definida.

Feito com ❤️ por **Joseph Cavalcante**.
