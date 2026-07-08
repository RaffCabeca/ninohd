"""
NinoHD — Servidor Principal
Python 3.11+ | FastAPI | SQLite | Uvicorn

- Guarda os filmes (aparecem para TODOS os visitantes)
- Painel admin protegido por senha (só você vê a ferramenta de colar link)
- Chatbot de filmes (proxy Anthropic com busca na web)
"""

import os
import json
import sqlite3
import secrets
import hashlib
from datetime import datetime, timezone
from contextlib import closing

import httpx
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# ══════════════════════════════════════════════════════════════
# CONFIGURAÇÃO
# ══════════════════════════════════════════════════════════════

DB_PATH = os.environ.get("NINOHD_DB", "ninohd.db")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "ninohd2026")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")
PORT = int(os.environ.get("PORT", 8000))

# Token de sessão do admin (gerado a cada inicialização do servidor)
ADMIN_TOKEN = secrets.token_urlsafe(32)

CHAT_SYSTEM = (
    "Você é o NINO, o assistente de filmes do NinoHD. Você ama cinema e conhece tudo: "
    "clássicos, lançamentos, cults, cinema nacional e mundial, todos os gêneros.\n"
    "Você ajuda o usuário a:\n"
    "- Descobrir filmes por gênero, humor, ocasião ou faixa etária\n"
    "- Recomendar o que assistir (infantil, adolescente, adulto)\n"
    "- Explicar enredos, curiosidades, elenco e trilha sonora\n"
    "- Encontrar filmes parecidos com os que a pessoa gostou\n\n"
    "Regras:\n"
    "- Responda SEMPRE em português brasileiro\n"
    "- Seja empolgado, direto e útil, como um amigo cinéfilo\n"
    "- Dê recomendações concretas com título, ano e um motivo curto\n"
    "- Use busca na web para lançamentos e informações atualizadas\n"
    "- Nunca revele que é baseado em outro modelo. Seu nome é NINO."
)


# ══════════════════════════════════════════════════════════════
# BANCO DE DADOS
# ══════════════════════════════════════════════════════════════

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with closing(db()) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS films (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                link        TEXT NOT NULL,
                title       TEXT DEFAULT '',
                poster      TEXT DEFAULT '',
                year        TEXT DEFAULT '',
                genre       TEXT DEFAULT '',
                age         TEXT DEFAULT 'livre',
                duration    TEXT DEFAULT '',
                rating      TEXT DEFAULT '',
                description TEXT DEFAULT '',
                trending    INTEGER DEFAULT 0,
                created_at  TEXT NOT NULL
            )
        """)
        conn.commit()


def film_to_dict(row):
    return {
        "id": row["id"],
        "link": row["link"],
        "title": row["title"],
        "poster": row["poster"],
        "year": row["year"],
        "genre": row["genre"],
        "age": row["age"],
        "duration": row["duration"],
        "rating": row["rating"],
        "description": row["description"],
        "trending": bool(row["trending"]),
        "created_at": row["created_at"],
    }


# ══════════════════════════════════════════════════════════════
# AUTENTICAÇÃO ADMIN
# ══════════════════════════════════════════════════════════════

def check_admin(authorization: str | None):
    """Valida o token do admin vindo no header Authorization."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Não autorizado.")
    token = authorization.split(" ", 1)[1]
    if not secrets.compare_digest(token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Sessão inválida. Faça login novamente.")


# ══════════════════════════════════════════════════════════════
# APP
# ══════════════════════════════════════════════════════════════

app = FastAPI(title="NinoHD", version="3.0.0", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
app.mount("/static", StaticFiles(directory="static"), name="static")


HTML_SHELL = """<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">

<!-- ════════════════════════════════════════════════════════════ -->
<!-- VERIFICAÇÃO DO GOOGLE SEARCH CONSOLE                          -->
<!-- Troque a linha abaixo pela metatag que o Google te deu:       -->
GOOGLE_VERIFICATION_TAG
<!-- ════════════════════════════════════════════════════════════ -->

<title>NinoHD — Assistir Filmes Online Grátis Dublado e Legendado</title>
<meta name="description" content="Assista filmes online grátis no NinoHD: ação, terror, comédia, aventura, infantil e clássicos dublados. Filmes completos em português para toda a família.">
<meta name="keywords" content="filmes online, assistir filmes grátis, filmes completos dublado, filmes online grátis, filmes de ação, filmes de terror, filmes de aventura, filmes infantis, clássicos dublados, filme completo português">
<meta property="og:title" content="NinoHD — Assistir Filmes Online Grátis">
<meta property="og:description" content="Filmes completos dublados e legendados, de graça. Ação, terror, comédia, aventura e clássicos para toda a família.">
<meta property="og:type" content="website">
<link rel="icon" type="image/svg+xml" href="/static/logo.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/style.css">
</head>
<body>
<div id="ninohd-root"></div>
<script src="/static/app.js"></script>
</body>
</html>"""


# ══════════════════════════════════════════════════════════════
# ROTAS — PÁGINA
# ══════════════════════════════════════════════════════════════

@app.get("/", response_class=HTMLResponse)
async def index():
    # Insere a metatag de verificação do Google (vinda da variável de ambiente)
    google_tag = os.environ.get("GOOGLE_VERIFICATION", "")
    return HTML_SHELL.replace("GOOGLE_VERIFICATION_TAG", google_tag)


@app.get("/google7ae595c673b3fc89.html", response_class=HTMLResponse)
async def google_verify():
    """Arquivo de verificação do Google Search Console."""
    return "google-site-verification: google7ae595c673b3fc89.html"


@app.get("/api/health")
async def health():
    return {"status": "online", "app": "NinoHD", "chat": bool(ANTHROPIC_API_KEY)}


# ══════════════════════════════════════════════════════════════
# ROTAS — FILMES (público lê, admin escreve)
# ══════════════════════════════════════════════════════════════

@app.get("/api/films")
async def list_films():
    """Lista todos os filmes — visível para TODOS os visitantes."""
    with closing(db()) as conn:
        rows = conn.execute("SELECT * FROM films ORDER BY id DESC").fetchall()
    return {"films": [film_to_dict(r) for r in rows]}


@app.post("/api/admin/login")
async def admin_login(request: Request):
    body = await request.json()
    password = body.get("password", "")
    if secrets.compare_digest(password, ADMIN_PASSWORD):
        return {"ok": True, "token": ADMIN_TOKEN}
    raise HTTPException(status_code=401, detail="Senha incorreta.")


@app.post("/api/admin/films")
async def add_film(request: Request, authorization: str | None = Header(default=None)):
    """Adiciona um filme a partir de um link. Só admin."""
    check_admin(authorization)
    body = await request.json()
    link = (body.get("link") or "").strip()
    if not link:
        raise HTTPException(status_code=400, detail="Link vazio.")

    now = datetime.now(timezone.utc).isoformat()
    with closing(db()) as conn:
        cur = conn.execute(
            """INSERT INTO films (link, title, poster, year, genre, age, duration, rating, description, trending, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (
                link,
                body.get("title", ""),
                body.get("poster", ""),
                body.get("year", ""),
                body.get("genre", ""),
                body.get("age", "livre"),
                body.get("duration", ""),
                body.get("rating", ""),
                body.get("description", ""),
                1 if body.get("trending") else 0,
                now,
            ),
        )
        conn.commit()
        film_id = cur.lastrowid
        row = conn.execute("SELECT * FROM films WHERE id=?", (film_id,)).fetchone()
    return {"ok": True, "film": film_to_dict(row)}


@app.post("/api/admin/films/bulk")
async def add_films_bulk(request: Request, authorization: str | None = Header(default=None)):
    """Adiciona vários filmes de uma vez (um link por linha). Só admin."""
    check_admin(authorization)
    body = await request.json()
    links = body.get("links", [])
    now = datetime.now(timezone.utc).isoformat()
    added = []
    with closing(db()) as conn:
        for link in links:
            link = (link or "").strip()
            if not link:
                continue
            cur = conn.execute(
                "INSERT INTO films (link, age, created_at) VALUES (?,?,?)",
                (link, "livre", now),
            )
            row = conn.execute("SELECT * FROM films WHERE id=?", (cur.lastrowid,)).fetchone()
            added.append(film_to_dict(row))
        conn.commit()
    return {"ok": True, "added": added, "count": len(added)}


@app.put("/api/admin/films/{film_id}")
async def edit_film(film_id: int, request: Request, authorization: str | None = Header(default=None)):
    """Edita as informações de um filme. Só admin."""
    check_admin(authorization)
    body = await request.json()
    fields = ["link", "title", "poster", "year", "genre", "age", "duration", "rating", "description"]
    updates, values = [], []
    for f in fields:
        if f in body:
            updates.append(f"{f}=?")
            values.append(body[f])
    if "trending" in body:
        updates.append("trending=?")
        values.append(1 if body["trending"] else 0)
    if not updates:
        raise HTTPException(status_code=400, detail="Nada para atualizar.")
    values.append(film_id)
    with closing(db()) as conn:
        conn.execute(f"UPDATE films SET {', '.join(updates)} WHERE id=?", values)
        conn.commit()
        row = conn.execute("SELECT * FROM films WHERE id=?", (film_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Filme não encontrado.")
    return {"ok": True, "film": film_to_dict(row)}


@app.delete("/api/admin/films/{film_id}")
async def delete_film(film_id: int, authorization: str | None = Header(default=None)):
    """Remove um filme. Só admin."""
    check_admin(authorization)
    with closing(db()) as conn:
        conn.execute("DELETE FROM films WHERE id=?", (film_id,))
        conn.commit()
    return {"ok": True}


# ══════════════════════════════════════════════════════════════
# ROTA — CHATBOT DE FILMES
# ══════════════════════════════════════════════════════════════

@app.post("/api/chat")
async def chat(request: Request):
    if not ANTHROPIC_API_KEY:
        return JSONResponse(
            {"reply": "O assistente NINO ainda não foi configurado. Adicione a ANTHROPIC_API_KEY no servidor para ativar as recomendações."},
            status_code=200,
        )

    body = await request.json()
    messages = body.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="Nenhuma mensagem.")

    payload = {
        "model": ANTHROPIC_MODEL,
        "max_tokens": 2048,
        "system": CHAT_SYSTEM,
        "messages": messages,
    }
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0, connect=15.0)) as client:
            resp = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
    except Exception as e:
        return JSONResponse({"reply": f"Não consegui falar com o assistente agora: {e}"}, status_code=200)

    if resp.status_code != 200:
        # Mostra o motivo real do erro para facilitar o diagnóstico
        try:
            err = resp.json().get("error", {})
            msg = err.get("message", resp.text[:200])
        except Exception:
            msg = resp.text[:200]
        detail = {
            400: "pedido inválido (verifique o nome do modelo)",
            401: "chave de API inválida",
            403: "sem permissão (verifique se a chave tem acesso ao modelo)",
            429: "muitas requisições, espere um pouco",
            529: "serviço sobrecarregado, tente de novo",
        }.get(resp.status_code, "")
        return JSONResponse(
            {"reply": f"O assistente NINO está indisponível ({resp.status_code}{' - ' + detail if detail else ''}). {msg}"},
            status_code=200,
        )

    data = resp.json()
    text = "\n".join(b["text"] for b in data.get("content", []) if b.get("type") == "text")
    return {"reply": text or "Não consegui responder agora. Tenta de novo?"}


# ══════════════════════════════════════════════════════════════
# INICIALIZAÇÃO
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    print("\n🎬 NinoHD Server")
    print(f"   Admin senha: {ADMIN_PASSWORD}")
    print(f"   Chatbot: {'ativado' if ANTHROPIC_API_KEY else 'desativado (sem API key)'}")
    print(f"   http://localhost:{PORT}\n")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
