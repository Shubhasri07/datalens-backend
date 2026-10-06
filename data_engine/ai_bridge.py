import json
from analysis_executor import execute_analysis


def run_ai_request(df, ai_response):

    if isinstance(ai_response, str):
        request = json.loads(ai_response)
    else:
        request = ai_response

    result = execute_analysis(
        df,
        operation=request.get("operation"),
        column=request.get("column"),
        group_column=request.get("group_column"),
        value=request.get("value")
    )

    return result