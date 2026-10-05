SUPPORTED_OPERATIONS = [
    "average",
    "sum",
    "min",
    "max",
    "count",
    "median",
    "filter",
    "group_average",
    "group_sum",
    "group_count",
    "percentage",
    "correlation"
]


def validate_request(request):

    operation = request.get("operation")

    if operation not in SUPPORTED_OPERATIONS:
        raise ValueError(
            f"Unsupported operation: {operation}"
        )

    return True