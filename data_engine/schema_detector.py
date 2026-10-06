import pandas as pd


def detect_schema(df):

    schema = {}

    for column in df.columns:

        if pd.api.types.is_numeric_dtype(df[column]):
            schema[column] = "Number"

        elif pd.api.types.is_datetime64_any_dtype(df[column]):
            schema[column] = "Date"

        else:
            unique_values = df[column].nunique()

            if unique_values <= 10:
                schema[column] = "Category"
            else:
                schema[column] = "Text"

    return schema


if __name__ == "__main__":

    df = pd.read_csv("sample.csv")

    schema = detect_schema(df)

    print("=== SCHEMA DETECTION ===")

    for column, data_type in schema.items():
        print(f"{column}: {data_type}")