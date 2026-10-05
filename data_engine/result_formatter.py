import numpy as np
import pandas as pd


def to_python(x):
    if isinstance(x, np.generic):
        return x.item()
    if isinstance(x, pd.DataFrame):
        return x.to_dict("records")
    if isinstance(x, pd.Series):
        return x.to_dict()
    if isinstance(x, float) and x != x:  # NaN
        return None
    return x


def format_result(query_type, column, result):
    return {
        "query_type": query_type,
        "column": column,
        "result": to_python(result),
    }
    