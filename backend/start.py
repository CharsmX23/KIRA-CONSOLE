import os
import sys
import shutil
import subprocess

port = (
    os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT")
    or os.environ.get("PORT")
    or "9000"
)

# Catalyst puts packages in a venv, not in the system Python at /var/lang/bin/python3.
# Strategy: find whichever Python has uvicorn installed and use that.

def _has_uvicorn(python):
    try:
        r = subprocess.run([python, "-c", "import uvicorn"], capture_output=True, timeout=5)
        return r.returncode == 0
    except Exception:
        return False

# 1. If Catalyst activated a venv, the uvicorn script is already on PATH.
uvicorn_bin = shutil.which("uvicorn")
if uvicorn_bin:
    print(f"[KIRA] using uvicorn from PATH: {uvicorn_bin}, port={port}", flush=True)
    result = subprocess.run([uvicorn_bin, "main:app", "--host", "0.0.0.0", "--port", port])
    sys.exit(result.returncode)

# 2. Search known Catalyst venv locations.
_candidates = [
    "/var/task/.venv/bin/python3",
    "/var/code/.venv/bin/python3",
    "/var/task/venv/bin/python3",
    "/var/code/venv/bin/python3",
    "/usr/local/bin/python3",
    sys.executable,
]
for python in _candidates:
    if os.path.isfile(python) and _has_uvicorn(python):
        print(f"[KIRA] using {python}, port={port}", flush=True)
        result = subprocess.run(
            [python, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", port]
        )
        sys.exit(result.returncode)
    elif os.path.isfile(python):
        print(f"[KIRA] {python} exists but no uvicorn", flush=True)

print("[KIRA] ERROR: could not find Python with uvicorn. Checked:", _candidates, flush=True)
sys.exit(1)
