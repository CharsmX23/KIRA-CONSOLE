import os
import sys
import subprocess

port = (
    os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT")
    or os.environ.get("PORT")
    or "9000"
)

# Catalyst installs requirements.txt into a venv at /var/code/backend/.
# The system python3 at /var/lang/bin/python3 does NOT have these packages.
venv_python = "/var/code/backend/bin/python3"
python = venv_python if os.path.isfile(venv_python) else sys.executable

print(f"[KIRA] python={python} port={port}", flush=True)
result = subprocess.run(
    [python, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", port]
)
sys.exit(result.returncode)
