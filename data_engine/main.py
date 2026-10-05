from file_reader import read_file
from schema_detector import detect_schema
from data_cleaner import check_missing_values, check_duplicates
from statistics import calculate_statistics
from query_engine import run_query
from duckdb_engine import query_dataframe
from insights import generate_insights, generate_group_insights


def analyze_dataset(file_path):

    df = read_file(file_path)

    print("=== DATASET INFORMATION ===")
    print("Rows:", len(df))
    print("Columns:", len(df.columns))

    print("\n=== SCHEMA ===")
    print(detect_schema(df))

    print("\n=== MISSING VALUES ===")
    print(check_missing_values(df))

    print("\n=== DUPLICATES ===")
    print(check_duplicates(df))

    print("\n=== STATISTICS ===")
    print(calculate_statistics(df))

    print("\n=== QUERY RESULTS ===")

    print("Average Salary:")
    print(run_query(df, "average", "Salary"))

    print("\nTotal Salary:")
    print(run_query(df, "sum", "Salary"))

    print("\nHighest Salary:")
    print(run_query(df, "max", "Salary"))

    print("\nLowest Salary:")
    print(run_query(df, "min", "Salary"))

    print("\nAverage Salary by Department:")

    result = run_query(
        df,
        "group_average",
        column="Salary",
        group_column="Department"
    )

    print(result)

    print("\n=== AUTOMATIC INSIGHTS ===")

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

    print("\n=== DUCKDB RESULT ===")

    duckdb_result = query_dataframe(
        df,
        """
        SELECT Department,
               AVG(Salary) AS Average_Salary
        FROM df
        GROUP BY Department
        """
    )

    print(duckdb_result)


if __name__ == "__main__":

    file_path = input("Enter dataset file name: ")

    analyze_dataset(file_path)