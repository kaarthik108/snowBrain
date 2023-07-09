import { Table } from "chat";

export const tables: Table[] = [
  {
    name: "STREAM_HACKATHON.STREAMLIT.CUSTOMER_DETAILS",
    description: "Stores customer information",
    columns: [
      {
        name: "CUSTOMER_ID",
        type: "Number (38,0)",
        constraints: "Primary Key, Not Null - Unique identifier for customers",
      },
      {
        name: "FIRST_NAME",
        type: "Varchar (255)",
        constraints: "First name of the customer",
      },
      {
        name: "LAST_NAME",
        type: "Varchar (255)",
        constraints: "Last name of the customer",
      },
      {
        name: "EMAIL",
        type: "Varchar (255)",
        constraints: "Email address of the customer",
      },
      {
        name: "PHONE",
        type: "Varchar (20)",
        constraints: "Phone number of the customer",
      },
      {
        name: "ADDRESS",
        type: "Varchar (255)",
        constraints: "Physical address of the customer",
      },
    ],
  },
  {
    name: "STREAM_HACKATHON.STREAMLIT.ORDER_DETAILS",
    description: "Stores order information",
    columns: [
      {
        name: "ORDER_ID",
        type: "Number (38,0)",
        constraints: "Primary Key, Not Null - Unique identifier for orders",
      },
      {
        name: "CUSTOMER_ID",
        type: "Number (38,0)",
        constraints:
          "Foreign Key - CUSTOMER_DETAILS(CUSTOMER_ID) - Customer who made the order",
      },
      {
        name: "ORDER_DATE",
        type: "Date",
        constraints: "Date when the order was made",
      },
      {
        name: "TOTAL_AMOUNT",
        type: "Number (10,2)",
        constraints: "Total amount of the order",
      },
    ],
  },
  {
    name: "STREAM_HACKATHON.STREAMLIT.PAYMENTS",
    description: "Stores payment information",
    columns: [
      {
        name: "PAYMENT_ID",
        type: "Number (38,0)",
        constraints: "Primary Key, Not Null - Unique identifier for payments",
      },
      {
        name: "ORDER_ID",
        type: "Number (38,0)",
        constraints:
          "Foreign Key - ORDER_DETAILS(ORDER_ID) - Associated order for the payment",
      },
      {
        name: "PAYMENT_DATE",
        type: "Date",
        constraints: "Date when the payment was made",
      },
      {
        name: "AMOUNT",
        type: "Number (10,2)",
        constraints: "Amount of the payment",
      },
    ],
  },
  {
    name: "STREAM_HACKATHON.STREAMLIT.PRODUCTS",
    description: "Stores product information",
    columns: [
      {
        name: "PRODUCT_ID",
        type: "Number (38,0)",
        constraints: "Primary Key, Not Null - Unique identifier for products",
      },
      {
        name: "PRODUCT_NAME",
        type: "Varchar (255)",
        constraints: "Name of the product",
      },
      {
        name: "CATEGORY",
        type: "Varchar (255)",
        constraints: "Category of the product",
      },
      {
        name: "PRICE",
        type: "Number (10,2)",
        constraints: "Price of the product",
      },
    ],
  },
  {
    name: "STREAM_HACKATHON.STREAMLIT.TRANSACTIONS",
    description: "Stores transaction information",
    columns: [
      {
        name: "TRANSACTION_ID",
        type: "Number (38,0)",
        constraints:
          "Primary Key, Not Null - Unique identifier for transactions",
      },
      {
        name: "ORDER_ID",
        type: "Number (38,0)",
        constraints:
          "Foreign Key - ORDER_DETAILS(ORDER_ID) - Associated order for the transaction",
      },
      {
        name: "PRODUCT_ID",
        type: "Number (38,0)",
        constraints: "Product involved in the transaction",
      },
      {
        name: "QUANTITY",
        type: "Number (38,0)",
        constraints: "Quantity of the product in the transaction",
      },
      {
        name: "PRICE",
        type: "Number (10,2)",
        constraints: "Price of the product in the transaction",
      },
    ],
  },
];
