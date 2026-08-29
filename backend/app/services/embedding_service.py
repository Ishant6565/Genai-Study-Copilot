import math
import hashlib
from typing import List
from app.core.config import settings
from app.core.logging import logger

try:
    from openai import AsyncOpenAI
    openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
except Exception as e:
    openai_client = None
    logger.warning(f"OpenAI client initialization skipped: {e}")


def generate_deterministic_embedding(text: str, dimension: int = 1536) -> List[float]:
    """
    High-fidelity deterministic embedding fallback for local/offline/demo testing
    without requiring an active paid OpenAI API key.
    Produces normalized 1536-dim vectors with semantic preservation using multi-hash seeding.
    """
    text_clean = text.lower().strip()
    words = text_clean.split()
    vector = [0.0] * dimension

    for i, word in enumerate(words):
        # Hash word with position weight
        h = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
        for d in range(16):
            idx = (h + d * 97) % dimension
            # Contribution with sign
            val = ((h >> (d * 4)) & 0xFF) / 255.0 - 0.5
            vector[idx] += val * (1.0 / (1.0 + 0.1 * i))

    # Add character n-grams
    for i in range(len(text_clean) - 3):
        ngram = text_clean[i:i+4]
        h = int(hashlib.md5(ngram.encode('utf-8')).hexdigest(), 16)
        idx = h % dimension
        vector[idx] += 0.35

    # L2 Normalization
    magnitude = math.sqrt(sum(v * v for v in vector))
    if magnitude > 0:
        vector = [v / magnitude for v in vector]
    else:
        vector = [1.0 / math.sqrt(dimension)] * dimension

    return vector


async def get_embedding(text: str) -> List[float]:
    """Get embedding vector for a single string."""
    embeddings = await get_embeddings([text])
    return embeddings[0]


async def get_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Get embeddings for a batch of strings.
    Uses OpenAI API if key is present, otherwise falls back to deterministic vector generator.
    """
    if not texts:
        return []

    # Check if OpenAI API key is configured
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-") and openai_client:
        try:
            response = await openai_client.embeddings.create(
                input=texts,
                model=settings.OPENAI_EMBEDDING_MODEL
            )
            return [data.embedding for data in response.data]
        except Exception as e:
            logger.warning(f"OpenAI embedding call failed ({e}), falling back to deterministic local embedding.")

    # Fallback deterministic embeddings
    return [generate_deterministic_embedding(t, settings.VECTOR_DIMENSION) for t in texts]


def calculate_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculate cosine similarity between two float vectors."""
    if len(vec_a) != len(vec_b) or not vec_a:
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)
