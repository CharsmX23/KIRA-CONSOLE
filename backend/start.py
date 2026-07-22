import os
import sys
import shutil
import subprocess

port = (
    os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT")
    or os.environ.get("PORT")
    or "9000"
)

# ── diagnostic: find where (if anywhere) uvicorn was installed ────────────────
find = subprocess.run(
    ["find", "/", "-name", "uvicorn", "-not", "-path", "*/proc/*", "-maxdepth", "10"],
    capture_output=True, text=True, timeout=15,
)
print("[KIRA] uvicorn locations on fs:", find.stdout.strip() or "NONE FOUND", flush=True)

pip_list = subprocess.run(
    [sys.executable, "-m", "pip", "list", "--format=columns"],
    capture_output=True, text=True, timeout=15,
)
# Print first 20 lines so we can see what IS installed
lines = pip_list.stdout.strip().splitlines()
print(f"[KIRA] pip list ({len(lines)} pkgs):", "\n".join(lines[:20]), flush=True)
# ─────────────────────────────────────────────────────────────────────────────

# If pip list shows nothing useful, install requirements ourselves
try:
    import uvicorn
    have_uvicorn = True
except ImportError:
    have_uvicorn = False

if not have_uvicorn:
    print("[KIRA] uvicorn not importable — running pip install", flush=True)
    r = subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "--quiet"],
        capture_output=True, text=True, timeout=300,
    )
    print(f"[KIRA] pip install exit={r.returncode}", flush=True)
    if r.stderr:
        print("[KIRA] pip stderr:", r.stderr[-800:], flush=True)

result = subprocess.run(
    [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", port]
)
sys.exit(result.returncode)
