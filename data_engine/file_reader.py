import pandas as pd


def read_file(file_path):

    if file_path.endswith(".csv"):
        return pd.read_csv(file_path)

    elif file_path.endswith(".xlsx") or file_path.endswith(".xls"):
        return pd.read_excel(file_path)

    elif file_path.endswith(".json"):
        return pd.read_json(file_path)

    else:
        raise ValueError("Unsupported file format")