import os
import sys

# Catalyst AppSail does not run pip install — packages are bundled in packages/.
_here = os.path.dirname(os.path.abspath(__file__))
_pkg = os.path.join(_here, "packages")
if os.path.isdir(_pkg) and _pkg not in sys.path:
    sys.path.insert(0, _pkg)

port = int(
    os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT")
    or os.environ.get("PORT")
    or "9000"
)

print(f"[KIRA] starting on port={port}", flush=True)

import uvicorn
uvicorn.run("main:app", host="0.0.0.0", port=port)
