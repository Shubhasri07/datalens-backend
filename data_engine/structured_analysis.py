from file_reader import read_file
from schema_detector import detect_schema
from data_cleaner import data_quality_report
from statistics import calculate_statistics
from insights import generate_insights


def analyze_dataset_structured(file_path):

    df = read_file(file_path)

    analysis = {
        "dataset": {
            "rows": len(df),
            "columns": len(df.columns)
        },

        "schema": detect_schema(df),

        "data_quality": data_quality_report(df),

        "statistics": calculate_statistics(df).to_dict(),

        "insights": generate_insights(df)
    }

    return analysis


if __name__ == "__main__":

    import json

    result = analyze_dataset_structured("sample.csv")

    print("=== STRUCTURED ANALYSIS ===")
    print(json.dumps(result, indent=2, default=str)) 