import pandas as pd

df = pd.read_csv("sample.csv")

print("=== DATASET INFORMATION ===")

print("Number of rows:", len(df))
print("Number of columns:", len(df.columns))

print("\nColumns:")
print(df.columns.tolist())

print("\nData types:")
print(df.dtypes)

print("\nFirst 5 rows:")
print(df.head())

print("\nStatistics:")
print(df.describe())