def interpret_query(question, df):

    question_lower = question.lower()

    # -------------------------
    # Detect column
    # -------------------------

    detected_column = None

    for column in df.columns:
        if column.lower() in question_lower:
            detected_column = column
            break

    # -------------------------
    # Detect filter value
    # -------------------------

    detected_value = None
    value_column = None

    for column in df.columns:

        for value in df[column].dropna().unique():

            if str(value).lower() in question_lower:

                # Ignore numeric values for categorical filtering
                if not str(value).isdigit():

                    detected_value = value
                    value_column = column
                    break

        if detected_value is not None:
            break

    # -------------------------
    # Percentage questions
    # -------------------------

    if "percentage" in question_lower or "%" in question_lower:

        return {
            "operation": "percentage",
            "column": value_column,
            "value": detected_value
        }

    # -------------------------
    # Average questions
    # -------------------------

    if "average" in question_lower or "mean" in question_lower:

        return {
            "operation": "average",
            "column": detected_column
        }

    # -------------------------
    # Total / Sum
    # -------------------------

    if "total" in question_lower or "sum" in question_lower:

        return {
            "operation": "sum",
            "column": detected_column
        }

    # -------------------------
    # Highest / Maximum
    # -------------------------

    if (
        "highest" in question_lower
        or "maximum" in question_lower
        or "max" in question_lower
    ):

        return {
            "operation": "max",
            "column": detected_column
        }

    # -------------------------
    # Lowest / Minimum
    # -------------------------

    if (
        "lowest" in question_lower
        or "minimum" in question_lower
        or "min" in question_lower
    ):

        return {
            "operation": "min",
            "column": detected_column
        }

    # -------------------------
    # Median
    # -------------------------

    if "median" in question_lower:

        return {
            "operation": "median",
            "column": detected_column
        }

    # -------------------------
    # Count
    # -------------------------

    if (
        "how many" in question_lower
        or "count" in question_lower
        or "number of" in question_lower
    ):

        return {
            "operation": "count",
            "column": detected_column
        }

    # -------------------------
    # Filter questions
    # -------------------------

    if (
        "show" in question_lower
        or "display" in question_lower
        or "list" in question_lower
    ):

        if value_column is not None and detected_value is not None:

            return {
                "operation": "filter",
                "column": value_column,
                "value": detected_value
            }

    # -------------------------
    # Group average
    # -------------------------

    if (
        "by department" in question_lower
        or "for each department" in question_lower
        or "department wise" in question_lower
    ):

        return {
            "operation": "group_average",
            "column": detected_column,
            "group_column": "Department"
        }

    # -------------------------
    # Unknown question
    # -------------------------

    return {
        "operation": "unknown"
    }


if __name__ == "__main__":

    import pandas as pd

    df = pd.read_csv("sample.csv")

    questions = [
        "What is the average salary?",
        "What is the highest salary?",
        "What is the total salary?",
        "What is the percentage of CSE employees?",
        "How many employees are there?",
        "Show CSE employees.",
        "What is the average salary by department?"
    ]

    print("=== QUESTION INTERPRETER ===")

    for question in questions:

        request = interpret_query(question, df)

        print("\nQuestion:", question)
        print("Request:", request)