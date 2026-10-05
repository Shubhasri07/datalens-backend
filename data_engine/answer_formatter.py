def format_answer(question, request, result):

    operation = request.get("operation")

    if operation == "average":
        return f"The average {request.get('column')} is {result:.2f}."

    elif operation == "sum":
        return f"The total {request.get('column')} is {result:.2f}."

    elif operation == "max":
        return f"The highest {request.get('column')} is {result}."

    elif operation == "min":
        return f"The lowest {request.get('column')} is {result}."

    elif operation == "median":
        return f"The median {request.get('column')} is {result:.2f}."

    elif operation == "count":
        return f"The count is {result}."

    elif operation == "percentage":
        return (
            f"{request.get('value')} represents "
            f"{result:.2f}% of the dataset."
        )

    elif operation == "filter":
        return result.to_string(index=False)

    elif operation == "group_average":
        return (
            f"Average {request.get('column')} "
            f"by {request.get('group_column')}:\n"
            f"{result.to_string()}"
        )

    elif operation == "group_sum":
        return (
            f"Total {request.get('column')} "
            f"by {request.get('group_column')}:\n"
            f"{result.to_string()}"
        )

    else:
        return str(result)