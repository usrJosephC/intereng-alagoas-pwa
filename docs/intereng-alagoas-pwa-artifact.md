# Artifact — InterEng Alagoas PWA

Snapshot do repositório `https://github.com/usrJosephC/intereng-alagoas-pwa`, conferido na cópia de trabalho `C:\Users\Joseph\Documents\projetos\intereng-alagoas-pwa`.

## Estado atual

- Branch ativa: `feat/foto-comentario-perfil-social`
- Commit atual: `41ac5d5` — `fix: mostra avatar do usuario em posts, comentarios e no cartao do atleta`
- Estado local: branch alinhada com `origin/feat/foto-comentario-perfil-social`; apenas este diretório `docs/` está pendente por conter o artifact
- Remote configurado: `https://github.com/usrJosephC/intereng-alagoas-pwa.git`
- Stack: Next.js 16, React 19, TypeScript, Prisma 7, PostgreSQL, Supabase, Tailwind CSS 4, Three.js e PWA

## Branches observadas

| Branch | Commit de ponta | Contexto |
|---|---|---|
| `main` | `620d492` | base estável integrada |
| `dev` | `58668b4` | desenvolvimento e integração |
| `feat/cabecas-de-chave-manuais` | `27962a5` | cabeças de chave manuais no sorteio |
| `feat/foto-comentario-perfil-social` | `41ac5d5` | fotos, Instagram, perfil e avatares sociais |
| `feat/master-role-perfil-lgpd-visual` | — | funcionalidades de perfil, papel master e LGPD |
| `feat/podio-chaveamento-visual` | `75ea868` | pódio final e chaveamento visual |
| `feat/upload-fotos-galeria` | `6b64fe6` | upload de fotos em posts e perfil |
| `fix/painel-sumula-header-mobile` | `2a87d89` | correções do painel de súmula no mobile |

## Linha recente de commits

1. `41ac5d5` — exibe avatar do usuário em posts, comentários e cards de atletas
2. `a011907` — adiciona foto em comentários, Instagram e perfil visível entre atletas
3. `6898e8d` — integra a branch de upload de fotos da galeria
4. `6b64fe6` — permite upload de foto também nos posts da comunidade
5. `d1c779d` — adiciona upload de foto de perfil e logo de atlética via Supabase Storage
6. `620d492` — integra a branch `dev` à `main`
7. `f2c7540` — documenta papéis, categorias, pódio, chaveamento e outras features

## Escopo funcional identificado

- Autenticação, cadastro, recuperação e redefinição de senha
- Perfil de usuário, avatar, Instagram e visibilidade entre atletas
- Comunidade com posts, comentários, fotos e armazenamento no Supabase
- Agenda de partidas, tabelas, pódio final e chaveamento visual
- Área administrativa para atléticas, usuários, locais, partidas, grupos e súmulas
- Papéis e permissões, auditoria, LGPD e recursos de administração master
- Persistência com Prisma/PostgreSQL e APIs no App Router
- PWA com manifest, service worker, ícones e assets esportivos
- Elementos visuais com Three.js, texturas e identidade da InterEng Alagoas

## Estrutura relevante

- `src/app/`: páginas públicas, autenticação, agenda, comunidade, tabelas e administração
- `src/components/`: componentes de navegação, autenticação, comunidade, perfil, tabelas e admin
- `src/lib/`: autenticação, autorização, Prisma, storage, e-mail, auditoria, sorteio e regras esportivas
- `prisma/`: schema, seed e migrações de banco
- `public/`: manifest, service worker, ícones, logos, texturas e imagens esportivas

## Mudanças implementadas no working tree

- Cadastro: limites de caracteres nos campos, campos longos adaptativos e data de nascimento composta por seletores de dia, mês e ano, com opção de limpar.
- Comentários: conteúdo opcional quando há foto, limite de 200 caracteres e textarea expansível.
- Posts/comentários: controles de exclusão para autores e administradores, com novas rotas DELETE e validação de autoria no backend.
- Perfil: fluxo de exclusão de conta com confirmação, remoção de dados/arquivos relacionados, encerramento de sessão e redirecionamento.

## Verificação técnica

- `npm run lint`: passou.
- `npx tsc --noEmit --incremental false`: passou.
- Working tree contém alterações em 17 arquivos e novas rotas de exclusão.

## Pendências encontradas na revisão

- Exclusão pelo próprio usuário comum ainda é bloqueada pelo `src/proxy.ts` antes de alcançar as rotas protegidas sob `/api/admin/*`. Os handlers validam autoria, mas o middleware precisa permitir esse fluxo.
- O limite de 200 caracteres foi aplicado aos comentários, porém o post principal ainda aceita até 2.000 caracteres na API e o composer não impõe 200.
- A textarea de comentário possui altura máxima; textos muito longos podem deixar de ficar totalmente visíveis após atingir esse limite. Deve-se trocar por rolagem explícita ou remover o teto conforme a decisão de UX.
- A exclusão de conta foi implementada, mas deve ser validada manualmente com dados reais e relações Prisma/Supabase antes de publicação.

## Ponto de partida para as próximas mudanças

Usar a branch `feat/foto-comentario-perfil-social` no commit `41ac5d5` como base. O artifact corresponde ao repositório InterEng Alagoas PWA. Antes de considerar esta rodada pronta, corrigir os dois bloqueios funcionais acima e executar testes manuais de cadastro, comentários, exclusão de conteúdo e exclusão de conta.

## Estado de entrega

- Branch de correções: `fix/ajustes-comunidade-cadastro`
- Commit: `c0ad400` — `fix: ajustar uploads, comentarios e cadastro`
- PR para `dev`: [#9](https://github.com/usrJosephC/intereng-alagoas-pwa/pull/9)
- PR de release `dev` → `main`: [#10](https://github.com/usrJosephC/intereng-alagoas-pwa/pull/10)
- Ambas as PRs foram abertas sem coautoria de IA; o merge permanece sob autorização do responsável.
- Validações da rodada: `npm run lint`, `npx tsc --noEmit --incremental false` e `git diff --check` aprovados.
