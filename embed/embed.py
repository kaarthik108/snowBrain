import os
import json
import hashlib
from uuid import uuid4
import logging
from typing import Dict
from tqdm.auto import tqdm
from dotenv import load_dotenv

import tiktoken
from pinecone import Pinecone

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader
from langchain_openai import OpenAIEmbeddings

load_dotenv()

logging.basicConfig(level=logging.INFO)


EMBEDDING_MODEL = "text-embedding-3-small"
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
PINECONE_API_KEY = os.environ["PINECONE_API_KEY"]
# PINECONE_ENVIRONMENT = os.environ["PINECONE_ENVIRONMENT"]


class TextProcessor:
    def __init__(
        self,
        docs_path: str,
        checksum_file: str,
        index_name: str,
        batch_limit: int = 100,
    ):
        self.docs_path = docs_path
        self.checksum_file = checksum_file
        self.index_name = index_name
        self.batch_limit = batch_limit
        # self.pod_type = "s1.x1"
        self.dimension = 512
        self.metric = "cosine"
        self.name_space = "snowbrain"

        self.texts = []
        self.metadatas = []
        self.checksum_dict = self.load_checksums()

        logging.info("Initializing embeddings...")
        self.embed = OpenAIEmbeddings(
            model=EMBEDDING_MODEL,
            openai_api_key=OPENAI_API_KEY,
            dimensions=self.dimension,
        )

        # tiktoken.encoding_for_model("gpt-3.5-turbo")
        # self.tokenizer = tiktoken.get_encoding("cl100k_base")

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=400,
            chunk_overlap=0,
            # length_function=self.tiktoken_len,
            separators=["\n\n", "\n", " ", ""],
        )

        self.pinecone_init()

    # def tiktoken_len(self, text: str) -> int:
    #     tokens = self.tokenizer.encode(text, disallowed_special=())
    #     return len(tokens)

    def create_checksum(self, content: str) -> str:
        return hashlib.sha256(content.encode()).hexdigest()

    def load_checksums(self) -> Dict[str, str]:
        if os.path.exists(self.checksum_file):
            with open(self.checksum_file, "r") as f:
                try:
                    return json.load(f)
                except json.decoder.JSONDecodeError:
                    logging.warning(
                        "Checksum file is empty. Creating a new checksum dictionary."
                    )
                    return {}
        else:
            return {}

    def pinecone_init(self) -> None:
        logging.info("Initializing Pinecone...")
        pc = Pinecone(
            api_key=PINECONE_API_KEY,
            # environment=PINECONE_ENVIRONMENT,
        )
        # if self.index_name not in pinecone.list_indexes():
        #     logging.info("Creating index...")
        #     pinecone.create_index(
        #         name=self.index_name,
        #         metric=self.metric,
        #         dimension=self.dimension,
        #     )
        self.index = pc.Index(self.index_name)

    def process(self) -> None:
        logging.info("Loading data...")
        loader = DirectoryLoader(self.docs_path, glob="**/*.md")
        data = loader.load()
        self.text_splitter.split_documents(data)

        for i, record in enumerate(tqdm(data)):
            self.process_record(record)

        if self.texts:
            self.upload_batch()

        self.save_checksums()
        logging.info("Index statistics: \n{}".format(self.index.describe_index_stats()))

    def process_record(self, record) -> None:
        checksum = self.create_checksum(record.page_content)
        filename = record.metadata["source"]
        if checksum != self.checksum_dict.get(filename, None):
            logging.info(f"Processing record {filename}...")
            self.checksum_dict[filename] = checksum
            metadata = record.metadata
            recorded_text = self.text_splitter.split_text(record.page_content)
            record_metadatas = [
                {"chunk": j, "text": text, **metadata}
                for j, text in enumerate(recorded_text)
            ]
            self.texts.extend(recorded_text)
            self.metadatas.extend(record_metadatas)
            if len(self.texts) >= self.batch_limit:
                self.upload_batch()
                self.texts = []
                self.metadatas = []

    def upload_batch(self) -> None:
        logging.info("Uploading batch...")
        ids = [str(uuid4()) for _ in range(len(self.texts))]
        embeds = self.embed.embed_documents(self.texts)
        self.index.upsert(
            vectors=zip(ids, embeds, self.metadatas), namespace=self.name_space
        )

    def save_checksums(self) -> None:
        logging.info("Saving checksums...")
        with open(self.checksum_file, "w") as f:
            json.dump(self.checksum_dict, f)


if __name__ == "__main__":
    processor = TextProcessor("docs/", "checksums.json", "snowbrain-v1")
    processor.process()
