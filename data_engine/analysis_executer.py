import pandas as pd


def execute_analysis(
    df,
    operation,
    column=None,
    group_column=None,
    value=None,
    ascending=True
):

    if operation == "average":
        return df[column].mean()

    elif operation == "sum":
        return df[column].sum()

    elif operation == "min":
        return df[column].min()

    elif operation == "max":
        return df[column].max()

    elif operation == "count":
        return df[column].count()

    elif operation == "median":
        return df[column].median()

    elif operation == "filter":
        return df[df[column] == value]

    elif operation == "sort":
        return df.sort_values(
            by=column,
            ascending=ascending
        )

    elif operation == "group_average":
        return df.groupby(group_column)[column].mean()

    elif operation == "group_sum":
        return df.groupby(group_column)[column].sum()

    elif operation == "group_count":
        return df.groupby(group_column)[column].count()

    elif operation == "percentage":
        count = (df[column] == value).sum()
        total = len(df)

        if total == 0:
            return 0

        return (count / total) * 100

    elif operation == "correlation":
        return df[column].corr(df[group_column])

    else:
        raise ValueError(
            f"Unsupported operation: {operation}"
        )


if __name__ == "__main__":

    df = pd.read_csv("sample.csv")

    print("=== GENERIC ANALYSIS TEST ===")

    print("Average Salary:")
    print(
        execute_analysis(
            df,
            "average",
            column="Salary"
        )
    )

    print("\nHighest Salary:")
    print(
        execute_analysis(
            df,
            "max",
            column="Salary"
        )
    )

    print("\nAverage Salary by Department:")
    print(
        execute_analysis(
            df,
            "group_average",
            column="Salary",
            group_column="Department"
        )
    )

    print("\nCSE Percentage:")
    print(
        execute_analysis(
            df,
            "percentage",
            column="Department",
            value="CSE"
        )
    )