import { Chat } from "@/types/Chat";

import { v4 as uuidv4 } from "uuid";

export const initialChatId = "Initial Chat";

export const defaultChat: Chat = {
  id: initialChatId,
  title: "Initial Chat",
  messages: [
    {
      id: uuidv4(),
      author: "user",
      content: "Show me the total revenue for each product category ?",
    },
    {
      id: uuidv4(),
      author: "assistant",
      content:
        " 'To get the total revenue for each product category, we need to join the PRODUCTS, TRANSACTIONS, ORDER_DETAILS, and PAYMENTS tables. Here's an example SQL query that should work in Snowflake:\n" +
        "\n" +
        "```\n" +
        "SELECT p.CATEGORY, SUM(t.PRICE * t.QUANTITY) AS TOTAL_REVENUE\n" +
        "FROM STREAM_HACKATHON.STREAMLIT.PRODUCTS p\n" +
        "JOIN STREAM_HACKATHON.STREAMLIT.TRANSACTIONS t ON p.PRODUCT_ID = t.PRODUCT_ID\n" +
        "JOIN STREAM_HACKATHON.STREAMLIT.ORDER_DETAILS o ON t.ORDER_ID = o.ORDER_ID\n" +
        "JOIN STREAM_HACKATHON.STREAMLIT.PAYMENTS pm ON o.ORDER_ID = pm.ORDER_ID\n" +
        "GROUP BY p.CATEGORY;\n" +
        "```\n" +
        "\n" +
        "This query joins the four tables on their respective keys and calculates the total revenue for each product category by multiplying the price and quantity of each transaction and summing them up. The result is grouped by category.",
    },
    {
      id: uuidv4(),
      author: "user",
      content:
        "Can you make some visualization on this? I want to see the total revenue for each product category.",
    },
    {
      id: uuidv4(),
      author: "assistant",
      content:
        " 'To visualize the total revenue for each product category, we can use a bar plot. Here's an example code using seaborn:\n" +
        "\n" +
        "```python\n" +
        "import seaborn as sns\n" +
        "import matplotlib.pyplot as plt\n" +
        "\n" +
        "# Assuming the data is already stored in a DataFrame called df\n" +
        "\n" +
        "# Group the data by category and calculate the total revenue\n" +
        "revenue_by_category = df.groupby('CATEGORY')['TOTAL_REVENUE'].sum().reset_index()\n" +
        "\n" +
        "# Create the bar plot\n" +
        "plt.figure(figsize=(10, 6))\n" +
        "sns.barplot(x='CATEGORY', y='TOTAL_REVENUE', data=revenue_by_category)\n" +
        "plt.xlabel('Product Category')\n" +
        "plt.ylabel('Total Revenue')\n" +
        "plt.title('Total Revenue by Product Category')\n" +
        "plt.xticks(rotation=45)\n" +
        "plt.show()\n" +
        "```\n" +
        "\n" +
        "This code first groups the data by category and calculates the sum of the total revenue for each category. Then, it creates a bar plot using seaborn's `barplot` function, with the x-axis representing the product categories and the y-axis representing the total revenue. The plot is then customized with labels and a title, and the x-axis labels are rotated for better readability.\n" +
        "\n",
    },
    {
      id: uuidv4(),
      author: "assistant",
      content:
        "https://res.cloudinary.com/dmq9hcus4/image/upload/v1687389412/vkyjqb1c1b1a9smjrypj.png",
    },
  ],
};
