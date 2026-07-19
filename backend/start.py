import os
import sys
import subprocess

port = (
    os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT")
    or os.environ.get("PORT")
    or "9000"
)

# Catalyst installs packages into a venv at /var/code/backend/.
# Try that venv Python first so all pip packages are available;
# fall back to whatever Python is running this script.
_venv_python = "/var/code/backend/bin/python3"
python = _venv_python if os.path.isfile(_venv_python) else sys.executable

print(f"[KIRA] python={python} port={port}", flush=True)
result = subprocess.run(
    [python, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", port],
)
sys.exit(result.returncode)
