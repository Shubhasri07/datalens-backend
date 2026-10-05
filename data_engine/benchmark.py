import time
import numpy as np
import pandas as pd
from question_engine import answer_question


SIZES = [10_000, 100_000, 1_000_000]


QUESTIONS = {
    "What is the average salary?":
        lambda df: df["Salary"].mean(),

    "What is the highest salary?":
        lambda df: df["Salary"].max(),

    "What is the total salary?":
        lambda df: df["Salary"].sum(),

    "What is the percentage of CSE employees?":
        lambda df: (df["Department"] == "CSE").mean() * 100,
}


def make_csv(rows, path):

    rng = np.random.default_rng(42)

    df = pd.DataFrame({
        "Name": [f"Person{i}" for i in range(rows)],
        "Age": rng.integers(20, 60, rows),
        "Department": rng.choice(
            ["CSE", "ECE", "MECH", "IT"],
            rows
        ),
        "Salary": rng.integers(
            20000,
            100000,
            rows
        ),
    })

    df.to_csv(path, index=False)

    return df


results = []


for size in SIZES:

    path = f"benchmark_{size}.csv"

    df = make_csv(size, path)

    for question, expected_fn in QUESTIONS.items():

        expected = float(expected_fn(df))

        start = time.perf_counter()

        answer = answer_question(
            path,
            question
        )

        elapsed = time.perf_counter() - start

        correct = False

        if answer.get("status") == "success":

            try:
                actual = float(answer.get("result"))

                correct = bool(
                    np.isclose(
                        actual,
                        expected,
                        rtol=1e-9,
                        atol=0.01
                    )
                )

            except (TypeError, ValueError):

                correct = False

        results.append({
            "rows": size,
            "question": question,
            "time_sec": round(elapsed, 3),
            "correct": correct
        })

        status = "OK" if correct else "FAIL"

        print(
            f"{size:>9} rows | "
            f"{elapsed:6.3f}s | "
            f"{status:4} | "
            f"{question}"
        )


out = pd.DataFrame(results)


out.to_csv(
    "benchmark_results.csv",
    index=False
)


print("\n==============================")
print(
    "Accuracy:",
    f"{out['correct'].mean() * 100:.0f}%"
)

print("\nAverage time by size:")

print(
    out.groupby("rows")["time_sec"].mean()
)

print("\nBenchmark completed.")