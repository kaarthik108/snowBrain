
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
SELECT P.PRODUCT_NAME, SUM(T.QUANTITY) AS TOTAL_QUANTITY
FROM STREAM_HACKATHON.STREAMLIT.TRANSACTIONS T
JOIN STREAM_HACKATHON.STREAMLIT.PRODUCTS P ON T.PRODUCT_ID = P.PRODUCT_ID
GROUP BY P.PRODUCT_NAME
""")
all_rows = cur.fetchall()
field_names = [i[0] for i in cur.description]
df = pd.DataFrame(all_rows)
df.columns = field_names

import pandas as pd
import matplotlib.pyplot as plt

# Assuming the data is stored in a DataFrame named df
plt.bar(df['PRODUCT_NAME'], df['TOTAL_QUANTITY'])
plt.xlabel('Product')
plt.ylabel('Total Quantity')
plt.title('Total Quantity of Each Product Sold')
plt.xticks(rotation=90)
plt.show()
plt.savefig("output.png")