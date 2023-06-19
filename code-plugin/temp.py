
import os
import snowflake.connector
import pandas as pd

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
cur.execute("""SELECT p.CATEGORY, SUM(py.AMOUNT) AS TOTAL_REVENUE
FROM STREAM_HACKATHON.STREAMLIT.PRODUCTS p
JOIN STREAM_HACKATHON.STREAMLIT.TRANSACTIONS t ON p.PRODUCT_ID = t.PRODUCT_ID
JOIN STREAM_HACKATHON.STREAMLIT.PAYMENTS py ON t.ORDER_ID = py.ORDER_ID
GROUP BY p.CATEGORY""")
all_rows = cur.fetchall()
field_names = [i[0] for i in cur.description]
df = pd.DataFrame(all_rows)
df.columns = field_names

import seaborn as sns
import matplotlib.pyplot as plt
import base64
from io import BytesIO

# Assuming the data is loaded into 'df'

# Create a barplot
sns.barplot(x='CATEGORY', y='TOTAL_REVENUE', data=df)
plt.savefig('barplot.png')

# Save the plot to a BytesIO object
buf = BytesIO()
plt.savefig(buf, format='png')
buf.seek(0)

# Convert plot to a base64 string
plot_string = base64.b64encode(buf.read()).decode()

print(plot_string)