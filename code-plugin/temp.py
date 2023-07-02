
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
SELECT CUSTOMER_ID, AVG(TOTAL_AMOUNT) as AVG_ORDER_AMOUNT
FROM STREAM_HACKATHON.STREAMLIT.ORDER_DETAILS
GROUP BY CUSTOMER_ID;
""")
all_rows = cur.fetchall()
field_names = [i[0] for i in cur.description]
df = pd.DataFrame(all_rows)
df.columns = field_names

import matplotlib.pyplot as plt

# Group orders by customer and calculate the average order amount
avg_order_amount = df.groupby('CUSTOMER_ID')['TOTAL_AMOUNT'].mean()

# Generate bar chart
avg_order_amount.plot(kind='bar')

# Set labels and title
plt.xlabel('Customer ID')
plt.ylabel('Average Order Amount')
plt.title('Average Order Amount per Customer')

# Show the plot
plt.show()
plt.savefig("output.png")