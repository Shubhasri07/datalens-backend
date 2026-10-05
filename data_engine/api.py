from fastapi import FastAPI
from pydantic import BaseModel

from file_reader import read_file
from analysis_executer import execute_analysis
from answer_formatter import format_answer

app = FastAPI()


class AnalysisRequest(BaseModel):
    file_path: str
    operation: str
    column: str | None = None
    group_column: str | None = None
    value: str | None = None


@app.post("/analyze")
def analyze(request: AnalysisRequest):

    df = read_file(request.file_path)

    result = execute_analysis(
        df,
        operation=request.operation,
        column=request.column,
        group_column=request.group_column,
        value=request.value
    )

    answer = format_answer(
        "",
        request.model_dump(),
        result
    )

    return {
        "status": "success",
        "result": str(result),
        "answer": answer
    }