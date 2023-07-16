import type { Message } from 'ai'

export const initialChatId = 'initial'

export const defaultpayload = {
  id: 'initialChatId',
  path: '/chat/initialChatId',
  title: 'initialChatId',
  userId: '',
  messages: [
    {
      id: 'initialChatId',
      role: 'user',
      content: 'Show me the total revenue for each product category ?'
    },
    {
      id: '2',
      role: 'assistant',
      content:
        "To get the total revenue for each product category, we need to join the PRODUCTS, TRANSACTIONS, ORDER_DETAILS, and PAYMENTS tables. Here's an example SQL query that should work in Snowflake:\n" +
        '```\n' +
        'SELECT p.CATEGORY, SUM(t.PRICE * t.QUANTITY) AS TOTAL_REVENUE\n' +
        'FROM STREAM_HACKATHON.STREAMLIT.PRODUCTS p\n' +
        'JOIN STREAM_HACKATHON.STREAMLIT.TRANSACTIONS t ON p.PRODUCT_ID = t.PRODUCT_ID\n' +
        'JOIN STREAM_HACKATHON.STREAMLIT.ORDER_DETAILS o ON t.ORDER_ID = o.ORDER_ID\n' +
        'JOIN STREAM_HACKATHON.STREAMLIT.PAYMENTS pm ON o.ORDER_ID = pm.ORDER_ID\n' +
        'GROUP BY p.CATEGORY;\n' +
        '```\n' +
        'This query joins the four tables on their respective keys and calculates the total revenue for each product category by multiplying the price and quantity of each transaction and summing them up. The result is grouped by category.'
    },
    {
      id: '3',
      role: 'assistant',
      content:
        '\nCATEGORY | TOTAL_REVENUE\n--- | ---\nElectronics | 286.49\nGadgets | 140.25\nAccessories | 411.34\nAudio | 203.05\n'
    },
    {
      id: '4',
      role: 'user',
      content:
        'Can you make some visualization on this? I want to see the total revenue for each product category.'
    },
    {
      id: '5',
      role: 'assistant',
      content:
        "To visualize the total revenue for each product category, we can use a bar plot. Here's the Python code to create the visualization using the pandas and seaborn libraries:\n\n" +
        '```python\n' +
        'import pandas as pd\n' +
        'import seaborn as sns\n' +
        '\n' +
        "# Assuming the query result is stored in a DataFrame named 'df'\n" +
        "sns.barplot(x='CATEGORY', y='TOTAL_REVENUE', data=df)\n" +
        '```\n' +
        "Make sure to replace 'CATEGORY' and 'TOTAL_REVENUE' with the actual column names returned by the SQL query. This code will create a bar plot with the product categories on the x-axis and the total revenue on the y-axis.\n\n" +
        "Let me know if there's anything else I can help you with!"
    },
    {
      id: '6',
      role: 'assistant',
      content:
        'https://res.cloudinary.com/dmq9hcus4/image/upload/v1688855825/snowbrain/hacgkibu5wx7tbiuehwj.png'
    }
  ]
}
export const _defaultpayload = [
  {
    id: 'initialChatId',
    role: 'user',
    content: 'hi'
  },
  {
    id: 'luqlwcH',
    role: 'assistant',
    content: 'Hi! How can I assist you today with SQL or data analysis?',
    createdAt: '2023-07-15T01:57:08.037Z'
  },
  {
    id: 'W2lXmFC',
    role: 'user',
    content:
      'Can you make some visualization on this? I want to see the total revenue for each product category.'
  },
  {
    id: 'vLXCZSW',
    role: 'assistant',
    content:
      "To visualize the total revenue for each product category, we can use a bar plot. Here's the SQL code to gather the necessary data:\n\n```sql\nSELECT p.CATEGORY, SUM(t.PRICE * t.QUANTITY) AS TOTAL_REVENUE\nFROM STREAM_HACKATHON.STREAMLIT.PRODUCTS p\nJOIN STREAM_HACKATHON.STREAMLIT.TRANSACTIONS t ON p.PRODUCT_ID = t.PRODUCT_ID\nGROUP BY p.CATEGORY\n```\n\nAnd here's the corresponding Python script to generate the bar plot using matplotlib:\n\n```python\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# Assuming you have already executed the SQL query and stored the result in a DataFrame named df\n\n# Plotting the bar plot\nplt.figure(figsize=(12, 6))\nplt.bar(df['CATEGORY'], df['TOTAL_REVENUE'])\nplt.xlabel('Product Category')\nplt.ylabel('Total Revenue')\nplt.title('Total Revenue for Each Product Category')\nplt.xticks(rotation=45)\nplt.show()\n```\n\nPlease note that you need to execute the SQL query and store the result in a DataFrame named `df` before running the Python script. Also, make sure you have the necessary privileges to access the tables in the Snowflake database.",
    createdAt: '2023-07-15T01:58:21.559Z'
  },
  {
    role: 'assistant',
    content:
      'https://res.cloudinary.com/dmq9hcus4/image/upload/v1689386309/snowbrain/fccdxuydw4n2gvxtjvra.png'
  }
] as Message[]
