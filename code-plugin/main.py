from __future__ import annotations

from common import stub

import subprocess
import sys
import modal

from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from pydantic import BaseModel


image = modal.Image.debian_slim(python_version="3.10").pip_install(
    "modal-client==0.55.3910",
    "fastapi==0.95.1",
    "uvicorn==0.22.0",
    "numpy==1.24.3",
    "matplotlib==3.7.1",
    "pillow==9.5.0",
    "seaborn==0.12.2",
    "snowflake-connector-python==3.0.0",
)
stub.sb_image = image


class Script(BaseModel):
    script: str
    sql: str


auth_scheme = HTTPBearer()


@stub.function(image=image, secret=modal.Secret.from_name("snowbrain"), cpu=2)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, HTTPException

    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.post("/execute")
    async def execute(
        script: Script,
        request: Request,
        token: HTTPAuthorizationCredentials = Depends(auth_scheme),
    ):
        import os

        if token.credentials != os.environ["AUTH_TOKEN"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect bearer token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        try:
            # Install the packages
            # for package in script.packages:
            #     subprocess.check_call([sys.executable, "-m", "pip", "install", package])

            # Prepare the script for getting data from Snowflake
            snowflake_script = f"""
import os
import snowflake.connector
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

conn = snowflake.connector.connect(
    user=os.environ["USER_NAME"],
    password=os.environ["PASSWORD"],
    account=os.environ["ACCOUNT"],
    warehouse=os.environ["WAREHOUSE"],
    role=os.environ["ROLE"],
    database=os.environ["DATABASE"],
    schema=os.environ["SCHEMA"],
)

cur = conn.cursor()
cur.execute('USE DATABASE ' + os.environ["DATABASE"])
cur.execute('USE SCHEMA ' + os.environ["SCHEMA"])
cur.execute(f\"\"\"
{script.sql}
\"\"\")
all_rows = cur.fetchall()
field_names = [i[0] for i in cur.description]
df = pd.DataFrame(all_rows)
df.columns = field_names
"""

            combined_script = (
                snowflake_script
                + "\n"
                + script.script
                + '\nplt.tight_layout()\n'
                + '\nplt.savefig("output.png", dpi=100)'
            )

            with open("temp.py", "w") as file:
                file.write(combined_script)

            proc = subprocess.run(
                [sys.executable, "temp.py"], capture_output=True, text=True
            )

            if proc.returncode == 0:
                try:
                    return FileResponse("output.png")
                except Exception as e:
                    raise HTTPException(
                        status_code=500, detail=f"Failed to encode image: {str(e)}"
                    )

            else:
                raise HTTPException(status_code=400, detail=proc.stderr)

        except Exception as e:
            # print(e, file=sys.stderr)
            raise HTTPException(status_code=500, detail=str(e))

    return app
