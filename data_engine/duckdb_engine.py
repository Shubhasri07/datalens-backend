import duckdb

def query_dataframe(df, sql_query):
    return duckdb.sql(sql_query).df()