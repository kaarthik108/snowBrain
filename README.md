# snowbrain

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kaarthik108/snowbrain&project-name=snowbrain&repo-name=snowbrain)


https://github.com/kaarthik108/snowbrain/assets/53030784/d4273bea-4494-438d-bce3-466788109b95


## Tech Stack
- [Snowflake](https://www.snowflake.com/) - Database processing
- [Next.js](https://nextjs.org/) - Frontend & backend
- [Tailwindcss](https://tailwindcss.com/) - Styling
- [Pinecone](https://www.pinecone.io/) - Vector database
- [OpenAI](https://www.openai.com/) - LLM
- [Langchain](https://js.langchain.com/docs/) - LLM wrapper
- [Cloudinary](https://cloudinary.com/) - Image data
- [Clerk.dev](https://clerk.dev/) - Auth
- [Upstash Redis](https://upstash.com/) - Rate limiting
- [Fast API](https://fastapi.tiangolo.com/) - Backend python
- [Modal Labs](https://modal.com/) - Host backend fastapi
- [Vercel](https://vercel.com/) - Hosting
- [umami](https://umami.is/) - Web analytics

## Features

- **Snowflake to Vector Database**: Automatic conversion of all Snowflake DDL to a vector database.
- **Conversational Memory**: Maintain context and improve the quality of interactions.
- **Snowflake Integration**: Integrate with Snowflake schema for automatic SQL generation and visualization.
- **Pinecone Vector Database**: Leverage Pinecone's vector database management system for efficient searching capabilities.
- **Secure Authentication**: Employ Clerk.dev for secure and hassle-free user authentication.
- **Rate Limit Handling**: Utilize Upstash Redis for managing rate limits.
- **Fast API**: High-performance Python web framework for building APIs.

## Example Queries

snowbrain is designed to make complex data querying simple. Here are some example queries you can try:

- **Total revenue per product category**: "Show me the total revenue for each product category."
- **Top customers by sales**: "Who are the top 10 customers by sales?"
- **Average order value per region**: "What is the average order value for each region?"
- **Order volume**: "How many orders were placed last week?"
- **Product price listing**: "Display the list of products with their prices."

## Installation

Follow these steps to get **snowbrain** up and running in your local environment.

1. **Update Environment Variables**

    Make sure to update the environment variables as necessary. Refer to the example provided:

    ```bash
    .env.example
    ```

2. **Auto fetch All Schema DDL**

    You can do this by running the following command:

    ```bash
    python embed/snowflake_ddl_fetcher.py
    ```

3. **Convert DDL Documents to Vector & Upload to Pinecone**

    Use the following command to do this:

    ```bash
    python embed/embed.py
    ```

4. **Install Dependencies for the Code Plugin**

    Navigate to the code plugin directory and install the necessary dependencies using Poetry:

    ```bash
    cd code-plugin && poetry install
    ```

5. **Deploy FastAPI to Modal Labs**

    Run the following command to deploy your FastAPI (make sure to add a secrets file in modal labs):

    ```bash
    modal deploy main.py
    ```

    After deploying, make sure to store the endpoint in your environment variables:

    ```bash
    MODAL_API_ENDPOINT=
    MODAL_AUTH_TOKEN=random_secret
    ```

6. **Install packages**

    Install packages using the following command:

    ```bash
    npm i
    ```

7. **Run Locally**

    Test the setup locally using the following command:

    ```bash
    npm run dev
    ```

8. **Deploy to Vercel**

    Finally, when you're ready, deploy the project to Vercel.

<br/>

Note: Vercel build is automatically blocked on folders code-plugin, embed and readme.md. You can additionally add a build block command in vercel's dashboard.

<br/>


## One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kaarthik108/snowbrain&project-name=snowbrain&repo-name=snowbrain)

<br/>

## Contributing

Here's how you can contribute:

- [Open an issue](https://github.com/kaarthik108/snowbrain/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/kaarthik108/snowbrain/pulls) to add new features/make improvements/fix bugs.

<br/>

## License

This repo is MIT licensed.
