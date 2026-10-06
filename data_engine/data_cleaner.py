import pandas as pd


def check_missing_values(df):
    return df.isnull().sum()


def check_duplicates(df):
    return df.duplicated().sum()


def check_empty_columns(df):
    return df.columns[df.isnull().all()].tolist()


def data_quality_report(df):

    return {
        "missing_values": check_missing_values(df).to_dict(),
        "duplicate_rows": int(check_duplicates(df)),
        "empty_columns": check_empty_columns(df)
    }


if __name__ == "__main__":

    df = pd.read_csv("sample.csv")

    print("=== DATA QUALITY REPORT ===")

    report = data_quality_report(df)

    print("\nMissing values:")
    print(report["missing_values"])

    print("\nDuplicate rows:")
    print(report["duplicate_rows"])

    print("\nEmpty columns:")
    print(report["empty_columns"])