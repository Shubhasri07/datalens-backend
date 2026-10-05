import pandas as pd


def run_query(df, query_type, column=None, group_column=None, value=None):

    if query_type == "average":
        return df[column].mean()

    elif query_type == "sum":
        return df[column].sum()

    elif query_type == "max":
        return df[column].max()

    elif query_type == "min":
        return df[column].min()

    elif query_type == "count":
        return df[column].count()

    elif query_type == "median":
        return df[column].median()

    elif query_type == "group_average":
        return df.groupby(group_column)[column].mean()

    elif query_type == "filter":
        return df[df[column] == value]

    else:
        raise ValueError("Unknown query type")


if __name__ == "__main__":

    df = pd.read_csv("sample.csv")

    print("=== QUERY ENGINE TEST ===")

    print("\nAverage Salary:")
    print(run_query(df, "average", "Salary"))

    print("\nTotal Salary:")
    print(run_query(df, "sum", "Salary"))

    print("\nHighest Salary:")
    print(run_query(df, "max", "Salary"))

    print("\nLowest Salary:")
    print(run_query(df, "min", "Salary"))

    print("\nEmployee Count:")
    print(run_query(df, "count", "Name"))

    print("\nMedian Salary:")
    print(run_query(df, "median", "Salary"))

    print("\nAverage Salary by Department:")
    print(run_query(
        df,
        "group_average",
        column="Salary",
        group_column="Department"
    ))

    print("\nCSE Employees:")
    print(run_query(
        df,
        "filter",
        column="Department",
        value="CSE"
    ))