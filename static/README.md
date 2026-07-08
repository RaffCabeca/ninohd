# 🎬 NinoHD

Site de filmes inspirado no UniTV. **Backend em Python (FastAPI) · Frontend em JS puro · CSS separado.**

Filmes em alta, tops, por gênero e por faixa etária (infantil, adolescente, adulto). Chatbot de filmes (NINO), player embutido e um painel admin **só seu** com 300 barras para colar links.

---

## Como funciona

- Você entra no **painel admin** (só você, protegido por senha) e **cola o link do filme** — do SnapTube, YouTube, Google Drive, Vimeo ou um arquivo `.mp4` direto.
- Ao publicar, o filme entra no catálogo e **aparece para todos os visitantes**, com card, capa, informações e player.
- Depois é só clicar em **Editar** no card para colocar capa, título, gênero, nota, faixa etária e sinopse.
- Os visitantes só veem os filmes prontos — **a ferramenta de colar link nunca aparece para eles.**

---

## Estrutura

```
ninohd/
├── server.py          # FastAPI: guarda os filmes (SQLite), auth admin, chatbot
├── static/
│   ├── app.js         # Toda a interface (JS puro)
│   └── style.css      # Estilos + animações + tema
├── requirements.txt
├── run.py             # Sobe o servidor e abre o Chrome
├── Procfile           # Deploy
└── .env.example
```

---

## Rodar no computador (abre o Chrome sozinho)

```bash
cd ninohd
cp .env.example .env      # edite e troque a ADMIN_PASSWORD
python3 run.py
```

O Chrome abre em `http://localhost:8000`.

Para entrar no painel: clique em **Entrar** (canto superior) e digite a senha do `.env` (padrão: `ninohd2026` — **troque!**).

---

## Colocar no ar (endereço público, abre no Chrome do celular)

### Railway
1. Suba a pasta `ninohd/` para um repositório no GitHub.
2. Em [railway.app](https://railway.app): **New Project → Deploy from GitHub repo**.
3. Em **Variables**, adicione:
   - `ADMIN_PASSWORD` = sua senha
   - `ANTHROPIC_API_KEY` = sua chave (opcional, ativa o chatbot NINO)
4. Railway sobe sozinho pelo `Procfile` e te dá a **URL pública** em Settings → Domains.

Essa URL é o endereço do site — abre em qualquer celular ou PC.

> ⚠ No Railway o banco SQLite reinicia a cada deploy. Para catálogo permanente, adicione um **Volume** apontando para o caminho do `ninohd.db` (ou me peça a versão com Postgres).

---

## Formatos de link aceitos no player

| Fonte            | Exemplo                                             |
|------------------|-----------------------------------------------------|
| YouTube          | `youtube.com/watch?v=...` ou `youtu.be/...`         |
| Google Drive     | `drive.google.com/file/d/.../view`                  |
| Vimeo            | `vimeo.com/123456`                                  |
| Arquivo direto   | `https://.../filme.mp4` (ou .webm, .mkv, .mov)      |

---

## Variáveis de ambiente

| Variável            | Obrigatória | Padrão              |
|---------------------|-------------|---------------------|
| `ADMIN_PASSWORD`    | Não*        | `ninohd2026`        |
| `ANTHROPIC_API_KEY` | Não         | — (chatbot off)     |
| `ANTHROPIC_MODEL`   | Não         | `claude-sonnet-4-6` |
| `PORT`              | Não         | `8000`              |

*Troque a senha antes de publicar.

---

## Sobre os links de filmes

O NinoHD é a plataforma — os links de filmes são adicionados por você. Publique apenas conteúdo que você tem o direito de disponibilizar (material próprio, licenciado ou de domínio público). A responsabilidade pelo conteúdo publicado é de quem administra o site.

---

© NinoHD — Seu cinema, sem limites.
