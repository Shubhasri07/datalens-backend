import pandas as pd


def generate_insights(df):

    insights = []

    # Numeric column insights
    numeric_columns = df.select_dtypes(include="number").columns

    for column in numeric_columns:

        average = df[column].mean()
        highest = df[column].max()
        lowest = df[column].min()

        insights.append(
            f"Average {column}: {average:.2f}"
        )

        insights.append(
            f"Highest {column}: {highest}"
        )

        insights.append(
            f"Lowest {column}: {lowest}"
        )

    # Category insights
    categorical_columns = df.select_dtypes(
        include=["object", "category"]
    ).columns

    for column in categorical_columns:

        counts = df[column].value_counts()

        if len(counts) > 0:

            most_common = counts.idxmax()

            insights.append(
                f"Most common {column}: {most_common}"
            )

    return insights

def generate_group_insights(df, group_column, value_column):

    grouped = df.groupby(group_column)[value_column].mean()

    highest_group = grouped.idxmax()
    highest_value = grouped.max()

    lowest_group = grouped.idxmin()
    lowest_value = grouped.min()

    return {
        "average_by_group": grouped.to_dict(),
        "highest_average_group": highest_group,
        "highest_average": highest_value,
        "lowest_average_group": lowest_group,
        "lowest_average": lowest_value
    }

if __name__ == "__main__":

    df = pd.read_csv("sample.csv")

    print("=== AUTOMATIC INSIGHTS ===")

    insights = generate_insights(df)

    for insight in insights:
        print("-", insight)

    print("\n=== GROUP INSIGHTS ===")

    group_insights = generate_group_insights(
        df,
        "Department",
        "Salary"
    )

    print("Average salary by department:")
    print(group_insights["average_by_group"])

    print(
        "Highest average salary department:",
        group_insights["highest_average_group"]
    )

    print(
        "Highest average salary:",
        group_insights["highest_average"]
    )

    print(
        "Lowest average salary department:",
        group_insights["lowest_average_group"]
    )

    print(
        "Lowest average salary:",
        group_insights["lowest_average"]
    )