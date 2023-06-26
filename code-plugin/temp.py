
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
SELECT CATEGORY, COUNT(*) AS PRODUCT_COUNT
FROM STREAM_HACKATHON.STREAMLIT.PRODUCTS
GROUP BY CATEGORY;
""")
all_rows = cur.fetchall()
field_names = [i[0] for i in cur.description]
df = pd.DataFrame(all_rows)
df.columns = field_names

import seaborn as sns

# Count the number of products in each category
product_counts = df['CATEGORY'].value_counts()

# Create a bar plot
sns.barplot(x=product_counts.index, y=product_counts.values)
plt.xlabel('Category')
plt.ylabel('Number of Products')
plt.title('Number of Products by Category')
plt.xticks(rotation=45)
plt.show()
plt.savefig("output.png")