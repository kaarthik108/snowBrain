from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List  
import subprocess
import sys
import base64

from fastapi.middleware.cors import CORSMiddleware
import modal

class Script(BaseModel):
    script: str
    packages: List[str]
    sql: str

@modal.asgi_app()
def fastapi_app():
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.post("/execute/")
    async def execute(script: Script):
        try:
            # Install the packages
            for package in script.packages:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])

            # Prepare the script for getting data from Snowflake
            snowflake_script = f"""
            import os
            import snowflake.connector
            import pandas as pd

            conn = snowflake.connector.connect(
                user=os.environ["SNOWFLAKE_USER"],
                password=os.environ["SNOWFLAKE_PASSWORD"],
                account=os.environ["SNOWFLAKE_ACCOUNT"],
                warehouse=os.environ["SNOWFLAKE_WAREHOUSE"],
                role=os.environ["SNOWFLAKE_ROLE"],
                database=os.environ["SNOWFLAKE_DATABASE"],
                schema=os.environ["SNOWFLAKE_SCHEMA"],
            )

            cur = conn.cursor()
            cur.execute('USE DATABASE ' + os.environ["SNOWFLAKE_DATABASE"])
            cur.execute('USE SCHEMA ' + os.environ["SNOWFLAKE_SCHEMA"])
            cur.execute(f'{script.sql}')
            all_rows = cur.fetchall()
            field_names = [i[0] for i in cur.description]
            df = pd.DataFrame(all_rows)
            df.columns = field_names
            """

            # Combine the Snowflake script and the user's script into one Python file
            combined_script = snowflake_script + "\n" + script.script

            # Write the combined script to a temporary Python file
            with open('temp.py', 'w') as file:
                file.write(combined_script)

            # Execute the script and capture the output
            proc = subprocess.run([sys.executable, 'temp.py'], capture_output=True, text=True)

            # If the script was successful, return the output as a base64 string
            if proc.returncode == 0:
                output = base64.b64encode(proc.stdout.encode()).decode()
                return {"base64String": output}

            # If the script failed, return the error
            else:
                raise HTTPException(status_code=400, detail=proc.stderr)

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return app

