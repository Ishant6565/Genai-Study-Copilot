import pytest
from httpx import AsyncClient
from app.services.embedding_service import get_embeddings, calculate_cosine_similarity
from app.services.document_service import clean_text, chunk_document_pages


@pytest.mark.asyncio
async def test_embedding_generation_and_cosine_similarity():
    texts = [
        "Distributed systems consensus and Raft protocol",
        "Raft consensus algorithm for replicated state machines",
        "Culinary recipes for Italian pasta carbonara"
    ]
    embeddings = await get_embeddings(texts)
    assert len(embeddings) == 3
    assert len(embeddings[0]) == 1536

    # Similarity between two related distributed systems texts should be higher than pasta
    sim_related = calculate_cosine_similarity(embeddings[0], embeddings[1])
    sim_unrelated = calculate_cosine_similarity(embeddings[0], embeddings[2])
    assert sim_related > sim_unrelated


def test_chunking_and_overlap():
    sample_pages = [
        {
            "page_number": 1,
            "text": "Introduction to Machine Learning. Machine learning algorithms build a model based on sample data. " * 30
        }
    ]
    chunks = chunk_document_pages(sample_pages, chunk_size_chars=500, chunk_overlap_chars=100)
    assert len(chunks) > 1
    assert chunks[0]["page_number"] == 1
    assert chunks[0]["chunk_index"] == 0
    assert len(chunks[0]["content"]) <= 600


@pytest.mark.asyncio
async def test_demo_chat_flow(client: AsyncClient):
    # 1. Login demo
    demo_res = await client.post("/api/v1/auth/demo-login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Ask RAG question
    chat_payload = {
        "message": "What is the primary role of recursive chunking?",
        "model": "gpt-4o-mini"
    }
    chat_res = await client.post("/api/v1/chat", json=chat_payload, headers=headers)
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "conversation_id" in data
    assert "content" in data["message"]
    assert len(data["message"]["content"]) > 20
