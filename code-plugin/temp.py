import os
import snowflake.connector
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

conn = snowflake.connector.connect(
    user=os.environ["USER_NAME"],
    password=os.environ["PASSWORD"],
    account=os.environ["ACCOUNT"],
    warehouse=os.environ["WAREHOUSE"],
    role=os.environ["ROLE"],
    database=os.environ["DATABASE"],
    schema=os.environ["SCHEMA"],
)

cur = conn.cursor()
cur.execute("USE DATABASE " + os.environ["DATABASE"])
cur.execute("USE SCHEMA " + os.environ["SCHEMA"])
cur.execute(
    "SELECT p.CATEGORY, SUM(t.PRICE * t.QUANTITY) AS TOTAL_REVENUE FROM STREAM_HACKATHON.STREAMLIT.PRODUCTS p JOIN STREAM_HACKATHON.STREAMLIT.TRANSACTIONS t ON p.PRODUCT_ID = t.PRODUCT_ID JOIN STREAM_HACKATHON.STREAMLIT.ORDER_DETAILS o ON t.ORDER_ID = o.ORDER_ID JOIN STREAM_HACKATHON.STREAMLIT.PAYMENTS pm ON o.ORDER_ID = pm.ORDER_ID GROUP BY p.CATEGORY;"
)
all_rows = cur.fetchall()
field_names = [i[0] for i in cur.description]
df = pd.DataFrame(all_rows)
df.columns = field_names

import matplotlib.pyplot as plt

# Assuming the data is already stored in a DataFrame called df
# Group the data by category and calculate the total revenue for each category
revenue_by_category = df.groupby("CATEGORY")["TOTAL_REVENUE"].sum().reset_index()

# Create the bar plot
plt.bar(revenue_by_category["CATEGORY"], revenue_by_category["TOTAL_REVENUE"])
plt.xlabel("Category")
plt.ylabel("Total Revenue")
plt.title("Total Revenue for Each Product Category")
plt.xticks(rotation=90)
plt.show()
plt.savefig("output.png")
