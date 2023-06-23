import os
import snowflake.connector
from dataclasses import dataclass
from typing import List
from pydantic import BaseModel
from langchain.chat_models import ChatOpenAI


MODEL = "gpt-3.5-turbo-16k"


@dataclass
class SnowflakeConfig:
    """Configuration for Snowflake Connection."""

    user: str
    password: str
    account: str
    warehouse: str
    role: str
    database: str
    schema: str


class Table(BaseModel):
    """Table information model."""

    name: str


class DDLtoMarkdown:
    """Main Class to handle DDL to Markdown conversion."""

    def __init__(self, config: SnowflakeConfig):
        """Initialize with SnowflakeConfig."""
        self.config = config
        self.conn = None
        self.cur = None
        self.model = ChatOpenAI(model=MODEL)
        self.format = """
            **Table 1: DATABASE.SCHEMA.TABLE_NAME**

            This table contains the (description of the table)

            - COLUMN_NAME: datatype [Primary Key, not null etc] - Unique identifier for the (description of the column)
            ...
        """

    def connect(self):
        """Create a snowflake connection."""
        self.conn = snowflake.connector.connect(
            user=self.config.user,
            password=self.config.password,
            account=self.config.account,
            warehouse=self.config.warehouse,
            role=self.config.role,
            database=self.config.database,
            schema=self.config.schema,
        )
        self.cur = self.conn.cursor()

    def execute_sql(self, sql: str) -> List:
        """Execute SQL Query and return the results."""
        self.cur.execute(f"USE DATABASE {self.config.database}")
        self.cur.execute(f"USE SCHEMA {self.config.schema}")
        self.cur.execute(sql)
        return self.cur.fetchall()

    def get_all_tables(self) -> List[Table]:
        """Get all table names."""
        try:
            table_names = self.execute_sql(
                """
                SELECT DISTINCT TABLE_NAME
                FROM SNOWFLAKE.ACCOUNT_USAGE.TABLES
                WHERE DELETED IS NULL
            """
            )
            return [Table(name=table_name[0]) for table_name in table_names]
        except Exception as e:
            raise Exception(
                f"An error occurred make sure you have access to snowflake database: {e}"
            )

    def convert_and_save(self, table: Table):
        """Convert DDL to markdown and save as .md file."""
        try:
            file_path = f"docs/{table.name.lower()}.md"

            if os.path.exists(file_path):
                print(
                    f"Markdown file for table {table.name} already exists. Skipping..."
                )
                self.skipped += 1
                return

            ddl = self.execute_sql(f"SELECT GET_DDL('table', '{table.name}', true)")[0][
                0
            ]

            # Generate the markdown
            markdown = self.model.predict(
                f"convert this DDL: {ddl}\n to a markdown format like this FORMAT: {self.format}"
            )

            # Save markdown to a .md file
            with open(file_path, "w") as file:
                file.write(markdown)
                print(f"Created markdown file for table {table.name}")
                self.created += 1

        except Exception as e:
            print(f"An error occurred while processing table {table.name}: {e}")


if __name__ == "__main__":
    config = SnowflakeConfig(
        user=os.environ["USER_NAME"],
        password=os.environ["PASSWORD"],
        account=os.environ["ACCOUNT"],
        warehouse=os.environ["WAREHOUSE"],
        role=os.environ["ROLE"],
        database=os.environ["DATABASE"],
        schema=os.environ["SCHEMA"],
    )
    ddl_to_md = DDLtoMarkdown(config)
    ddl_to_md.connect()
    tables = ddl_to_md.get_all_tables()
    ddl_to_md.created = 0
    ddl_to_md.skipped = 0
    for table in tables:
        ddl_to_md.convert_and_save(table)
    print(f"Created markdown files for {ddl_to_md.created} tables.")
    print(f"Skipped {ddl_to_md.skipped} tables.")
