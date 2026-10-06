from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "DataLens Backend is running!"}


@app.get("/health")
def health():
    return {"status": "OK"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        filename = file.filename.lower()

        if filename.endswith(".csv"):
            try:
                df = pd.read_csv(io.BytesIO(content))
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(content), encoding="latin-1")

        elif filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(content), engine="openpyxl")

        elif filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(content), engine="xlrd")

        elif filename.endswith(".json"):
            data = json.loads(content.decode("utf-8"))
            if isinstance(data, list):
                df = pd.json_normalize(data)
            else:
                df = pd.json_normalize([data])

        else:
            return JSONResponse(
                status_code=400,
                content={"error": "Unsupported file type. Use CSV, XLSX, XLS or JSON."},
            )

        if df.empty:
            return JSONResponse(
                status_code=400,
                content={"error": "File is empty or has no data."},
            )

        # to_json converts NaN to null, so the response never breaks
        preview = json.loads(df.head(5).to_json(orient="records"))
        stats = json.loads(df.describe().to_json())

        return {
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "null_counts": df.isnull().sum().to_dict(),
            "preview": preview,
            "stats": stats,
            "message": "File uploaded successfully",
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Could not process file: {str(e)}"},
        )
    from fastapi.middleware.cors import CORSMiddleware        
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
)