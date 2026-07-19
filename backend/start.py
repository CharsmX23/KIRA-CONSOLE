import os
import sys
import subprocess

# Catalyst builds packages into a venv at /var/code/backend/
# Use that venv's python3 with -m uvicorn so all packages + working dir are correct.
PYTHON = "/var/code/backend/bin/python3"

port = (
    os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT")
    or os.environ.get("PORT")
    or "9000"
)

print(f"[KIRA] {PYTHON} -m uvicorn main:app port={port}", flush=True)
result = subprocess.run(
    [PYTHON, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", port],
)
sys.exit(result.returncode)
