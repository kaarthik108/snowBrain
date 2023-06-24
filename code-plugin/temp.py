
import os
import snowflake.connector
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

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
cur.execute('USE DATABASE ' + os.environ["DATABASE"])
cur.execute('USE SCHEMA ' + os.environ["SCHEMA"])
cur.execute(f"""
SELECT
    ORDER_DETAILS.ORDER_DATE,
    ORDER_DETAILS.ORDER_ID
FROM
    STREAM_HACKATHON.STREAMLIT.ORDER_DETAILS
JOIN
    STREAM_HACKATHON.STREAMLIT.TRANSACTIONS
ON
    ORDER_DETAILS.ORDER_ID = TRANSACTIONS.ORDER_ID;
""")
all_rows = cur.fetchall()
field_names = [i[0] for i in cur.description]
df = pd.DataFrame(all_rows)
df.columns = field_names

import seaborn as sns

# Group the orders by date and count the number of orders
orders_by_date = df.groupby('ORDER_DATE')['ORDER_ID'].count().reset_index()

# Create the bar plot
sns.barplot(data=orders_by_date, x='ORDER_DATE', y='ORDER_ID')
plt.savefig("output.png")