
import os
import snowflake.connector
import pandas as pd
import matplotlib
matplotlib.use('Agg')
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
cur.execute('USE DATABASE ' + os.environ["DATABASE"])
cur.execute('USE SCHEMA ' + os.environ["SCHEMA"])
cur.execute("""
SELECT t.TRANSACTION_ID, t.ORDER_ID, t.PRODUCT_ID, t.QUANTITY, t.PRICE,
       c.CUSTOMER_ID, c.FIRST_NAME, c.LAST_NAME, c.EMAIL, c.PHONE, c.ADDRESS,
       p.PRODUCT_NAME, p.CATEGORY, p.PRICE,
       o.ORDER_DATE, o.TOTAL_AMOUNT
FROM STREAM_HACKATHON.STREAMLIT.TRANSACTIONS t
JOIN STREAM_HACKATHON.STREAMLIT.ORDER_DETAILS o ON t.ORDER_ID = o.ORDER_ID
JOIN STREAM_HACKATHON.STREAMLIT.CUSTOMER_DETAILS c ON o.CUSTOMER_ID = c.CUSTOMER_ID
JOIN STREAM_HACKATHON.STREAMLIT.PRODUCTS p ON t.PRODUCT_ID = p.PRODUCT_ID;
""")
all_rows = cur.fetchall()
field_names = [i[0] for i in cur.description]
df = pd.DataFrame(all_rows)
df.columns = field_names

import matplotlib.pyplot as plt

# Assuming the data is stored in a DataFrame called df
df.groupby('CATEGORY')['PRICE'].sum().plot(kind='bar')
plt.savefig("output.png")