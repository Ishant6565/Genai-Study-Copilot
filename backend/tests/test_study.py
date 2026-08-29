import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_study_tools_flow(client: AsyncClient):
    # 1. Login demo
    demo_res = await client.post("/api/v1/auth/demo-login")
    token = demo_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get documents
    doc_res = await client.get("/api/v1/documents", headers=headers)
    assert doc_res.status_code == 200
    docs = doc_res.json()
    assert len(docs) > 0
    doc_id = docs[0]["id"]

    # 3. List Flashcards
    fc_res = await client.get(f"/api/v1/study/flashcards?document_id={doc_id}", headers=headers)
    assert fc_res.status_code == 200
    cards = fc_res.json()
    assert len(cards) >= 1

    # 4. List Quizzes
    quiz_res = await client.get(f"/api/v1/study/quizzes?document_id={doc_id}", headers=headers)
    assert quiz_res.status_code == 200
    quizzes = quiz_res.json()
    assert len(quizzes) >= 1
    quiz_id = quizzes[0]["id"]

    # 5. Submit Quiz Answers
    submit_payload = {
        "answers": [
            {"question_id": 1, "selected_option": 1},
            {"question_id": 2, "selected_option": 0},
            {"question_id": 3, "selected_option": 2}
        ]
    }
    grade_res = await client.post(f"/api/v1/study/quizzes/{quiz_id}/submit", json=submit_payload, headers=headers)
    assert grade_res.status_code == 200
    grade_data = grade_res.json()
    assert "score_percentage" in grade_data
    assert "feedback" in grade_data
    assert grade_data["correct_count"] >= 1
