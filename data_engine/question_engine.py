from file_reader import read_file
from natural_query import interpret_query
from analysis_executer import execute_analysis
from answer_formatter import format_answer
from result_formatter import to_python


def answer_question(file_path, question):
    try:
        # 1. Read dataset
        df = read_file(file_path)

        # 2. Understand the question
        request = interpret_query(question, df)

        # 3. Check whether question was understood
        if request["operation"] == "unknown":
            return {
                "question": question,
                "status": "error",
                "message": "I could not understand this question yet."
            }

        # 4. Execute the analysis
        result = execute_analysis(
            df,
            operation=request.get("operation"),
            column=request.get("column"),
            group_column=request.get("group_column"),
            value=request.get("value")
        )

        # 5. Create human-readable answer
        formatted_answer = format_answer(question, request, result)

        # 6. Return final result (JSON-safe)
        return {
            "question": question,
            "status": "success",
            "request": request,
            "result": to_python(result),
            "answer": formatted_answer
        }

    except Exception as e:
        return {
            "question": question,
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":

    print("=== DATASET QUESTION ENGINE ===")

    file_path = "sample.csv"

    questions = [
        "What is the average salary?",
        "What is the highest salary?",
        "What is the total salary?",
        "What is the percentage of CSE employees?"
    ]

    for question in questions:
        print("\nQuestion:")
        print(question)

        answer = answer_question(file_path, question)

        print("\nAnswer:")
        print(answer)