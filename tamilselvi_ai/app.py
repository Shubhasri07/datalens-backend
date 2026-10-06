import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

# Page configuration
st.set_page_config(
    page_title="AI Data Analyst",
    page_icon="📊",
    layout="wide"
)

st.title("📊 Schema-Agnostic Natural Language Data Analyst")

st.write(
    "Upload a CSV, Excel, or JSON dataset and ask questions "
    "about your data using natural language."
)


# ---------------- FILE LOADING ----------------

uploaded_file = st.file_uploader(
    "📂 Upload your dataset",
    type=["csv", "xlsx", "json"]
)


def load_file(file):

    filename = file.name.lower()

    if filename.endswith(".csv"):
        return pd.read_csv(file)

    elif filename.endswith(".xlsx"):
        return pd.read_excel(file)

    elif filename.endswith(".json"):
        return pd.read_json(file)

    else:
        raise ValueError("Unsupported file format")


# ---------------- QUESTION ANSWER ----------------

def answer_question(question, df):

    question = question.lower()

    numeric_columns = df.select_dtypes(
        include="number"
    ).columns.tolist()

    # Total
    if "total" in question or "sum" in question:

        if numeric_columns:

            column = numeric_columns[0]

            value = df[column].sum()

            st.success(
                f"Total of {column}: {value:,.2f}"
            )

        return

    # Average
    if "average" in question or "mean" in question:

        if numeric_columns:

            column = numeric_columns[0]

            value = df[column].mean()

            st.success(
                f"Average of {column}: {value:.2f}"
            )

        return

    # Highest
    if (
        "highest" in question
        or "maximum" in question
        or "max" in question
    ):

        if numeric_columns:

            column = numeric_columns[0]

            value = df[column].max()

            st.success(
                f"Highest {column}: {value}"
            )

        return

    # Lowest
    if (
        "lowest" in question
        or "minimum" in question
        or "min" in question
    ):

        if numeric_columns:

            column = numeric_columns[0]

            value = df[column].min()

            st.success(
                f"Lowest {column}: {value}"
            )

        return

    # Missing values
    if "missing" in question or "null" in question:

        total_missing = int(
            df.isnull().sum().sum()
        )

        st.success(
            f"Total missing values: {total_missing}"
        )

        return

    # Number of rows
    if (
        "rows" in question
        or "records" in question
        or "count" in question
    ):

        st.success(
            f"Total records: {len(df)}"
        )

        return

    # Columns
    if "column" in question:

        st.write("### Dataset Columns")

        for column in df.columns:

            st.write(f"• {column}")

        return

    st.info(
        "Try questions like: "
        "What is the average? "
        "What is the total? "
        "What is the highest value? "
        "Are there any missing values?"
    )


# ---------------- MAIN APP ----------------

if uploaded_file is not None:

    try:

        df = load_file(uploaded_file)

        st.success(
            f"✅ {uploaded_file.name} uploaded successfully!"
        )

        # Dataset preview
        st.subheader("📋 Dataset Preview")

        st.dataframe(
            df.head(100),
            use_container_width=True
        )

        # Dataset information
        st.subheader("🔍 Dataset Information")

        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric("Rows", df.shape[0])

        with col2:
            st.metric("Columns", df.shape[1])

        with col3:
            st.metric(
                "Missing Values",
                int(df.isnull().sum().sum())
            )

        # Schema
        st.subheader("🧠 Detected Schema")

        schema = pd.DataFrame({
            "Column": df.columns,
            "Data Type": df.dtypes.astype(str),
            "Missing Values": df.isnull().sum().values
        })

        st.dataframe(
            schema,
            use_container_width=True
        )

        # Numeric analysis
        numeric_columns = df.select_dtypes(
            include="number"
        ).columns.tolist()

        if numeric_columns:

            st.subheader("📈 Numeric Data Analysis")

            selected_column = st.selectbox(
                "Select a numeric column",
                numeric_columns
            )

            average = df[selected_column].mean()
            maximum = df[selected_column].max()
            minimum = df[selected_column].min()
            total = df[selected_column].sum()

            c1, c2, c3, c4 = st.columns(4)

            with c1:
                st.metric(
                    "Average",
                    round(average, 2)
                )

            with c2:
                st.metric(
                    "Maximum",
                    maximum
                )

            with c3:
                st.metric(
                    "Minimum",
                    minimum
                )

            with c4:
                st.metric(
                    "Total",
                    round(total, 2)
                )

            # Visualization
            st.subheader("📊 Data Visualization")

            fig, ax = plt.subplots()

            ax.hist(
                df[selected_column].dropna(),
                bins=10
            )

            ax.set_xlabel(selected_column)
            ax.set_ylabel("Frequency")
            ax.set_title(
                f"Distribution of {selected_column}"
            )

            st.pyplot(fig)

        # Natural language questions
        st.subheader(
            "🤖 Ask Questions About Your Data"
        )

        question = st.text_input(
            "Enter your question"
        )

        if question:

            answer_question(
                question,
                df
            )

    except Exception as e:

        st.error(
            f"❌ Error while processing file: {e}"
        )

else:

    st.info(
        "👆 Please upload a CSV, Excel, or JSON file "
        "to begin analysis."
    )