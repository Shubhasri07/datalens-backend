import pandas as pd
from query_engine import run_query


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
print("\nAverage Salary by Department:")

result = run_query(
    df,
    "group_average",
    column="Salary",
    group_column="Department"
)

print(result)