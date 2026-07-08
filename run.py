"""
NinoHD — Lançador
Sobe o servidor e abre o Chrome automaticamente.
Uso: python3 run.py
"""

import os, sys, time, threading, webbrowser, subprocess

PORT = int(os.environ.get("PORT", 8000))
URL = f"http://localhost:{PORT}"


def load_env():
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())


def find_chrome():
    if sys.platform.startswith("win"):
        c = [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
             r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
             os.path.expanduser(r"~\AppData\Local\Google\Chrome\Application\chrome.exe")]
    elif sys.platform == "darwin":
        c = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    else:
        c = ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
             "/usr/bin/chromium-browser", "/usr/bin/chromium", "/snap/bin/chromium"]
    for p in c:
        if os.path.exists(p):
            return p
    return None


def open_chrome():
    time.sleep(2.0)
    chrome = find_chrome()
    if chrome:
        try:
            webbrowser.register("chrome", None, webbrowser.BackgroundBrowser(chrome))
            webbrowser.get("chrome").open(URL)
            print(f"   Chrome aberto em {URL}")
            return
        except Exception:
            try:
                subprocess.Popen([chrome, URL]); print(f"   Chrome aberto em {URL}"); return
            except Exception:
                pass
    webbrowser.open(URL)
    print(f"   Navegador padrão aberto em {URL}")


def main():
    print("\n🎬 NinoHD")
    print("════════════════════════════════════")
    load_env()

    try:
        import fastapi, uvicorn, httpx  # noqa
    except ImportError:
        print("   Instalando dependências...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "--quiet"])

    print(f"   Senha admin: {os.environ.get('ADMIN_PASSWORD', 'ninohd2026')}")
    print(f"   Chatbot: {'ativado' if os.environ.get('ANTHROPIC_API_KEY') else 'desativado (adicione ANTHROPIC_API_KEY p/ ativar)'}")
    print(f"   URL: {URL}")
    print("════════════════════════════════════")
    print("   Abrindo o Chrome... (Ctrl+C encerra)\n")

    threading.Thread(target=open_chrome, daemon=True).start()

    import uvicorn
    from server import app
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")


if __name__ == "__main__":
    main()
