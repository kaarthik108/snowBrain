import type { Message } from 'ai'

export const initialChatId = 'initial'

export const _defaultpayload = [
  {
    role: 'user',
    content: 'hi'
  },
  {
    role: 'assistant',
    content: 'Hi there! How can I assist you today with SQL or data analysis?'
  },
  {
    role: 'user',
    content: 'Show me the total revenue for each product category.'
  },
  {
    role: 'assistant',
    content:
      "To show the total revenue for each product category, you can use the following SQL query:\n\n```sql\nSELECT p.CATEGORY, SUM(t.QUANTITY * t.PRICE) AS total_revenue\nFROM STREAM_HACKATHON.STREAMLIT.PRODUCTS p\nJOIN STREAM_HACKATHON.STREAMLIT.TRANSACTIONS t ON p.PRODUCT_ID = t.PRODUCT_ID\nGROUP BY p.CATEGORY;\n```\n\nThis query joins the `PRODUCTS` and `TRANSACTIONS` tables on the `PRODUCT_ID` column and calculates the total revenue for each category by multiplying the quantity of each product by its price and summing them up. The result is grouped by the product category.\n\nLet me know if there's anything else I can help you with!"
  },
  {
    role: 'assistant',
    content:
      '\nCATEGORY | TOTAL_REVENUE\n--- | ---\nElectronics | 286.49\nGadgets | 140.25\nAccessories | 411.34\nAudio | 203.05\n'
  },
  {
    role: 'user',
    content: 'Can you make some visualization on this ?'
  },
  {
    role: 'assistant',
    content:
      "Sure! To visualize the total revenue for each product category, you can use a bar plot. Here's a Python script that uses the pandas and seaborn libraries to generate the plot:\n\n```python\nimport pandas as pd\nimport seaborn as sns\n\n# Assuming you have already executed the SQL query and stored the result in a DataFrame named df\nsns.barplot(data=df, x='CATEGORY', y='TOTAL_REVENUE')\nplt.xlabel('Product Category')\nplt.ylabel('Total Revenue')\nplt.title('Total Revenue for Each Product Category')\nplt.xticks(rotation=45)\nplt.show()\n```\n\nThis script creates a bar plot using the seaborn library, with the x-axis representing the product categories and the y-axis representing the total revenue. The plot is then customized with appropriate labels and titles.\n\nPlease note that you need to have the seaborn and pandas libraries installed in your Python environment for the script to run successfully. Let me know if you need any further assistance!"
  },
  {
    role: 'assistant',
    content:
      'https://res.cloudinary.com/dmq9hcus4/image/upload/v1689669070/snowbrain/output_pdce81.png'
  }
] as Message[]
