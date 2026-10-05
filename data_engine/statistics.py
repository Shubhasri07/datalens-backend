import pandas as pd


def calculate_statistics(df):
    return df.describe()


if __name__ == "__main__":
    df = pd.read_csv("sample.csv")

    print("=== STATISTICS ===")

    statistics = calculate_statistics(df)

    print(statistics)