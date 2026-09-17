import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(tags=["AI Chat"])

# Заменить на нормальный
SYSTEM_PROMPT = """
Ты — дружелюбный и профессиональный ИИ-ассистент платформы "IT-инкубатор".
Твоя задача — помогать пользователям в навигации и отвечать на вопросы о проекте.

Информация о проекте:
IT-инкубатор — это современная веб-платформа, объединяющая реальный бизнес и студентов. 
Заказчики оставляют заявки на разработку IT-продуктов, а студенты получают опыт работы над коммерческими проектами под руководством менторов.

Уровни доступа:
1. Гость: Просмотр витрины услуг.
2. Заказчик (Customer): Создание заявок, ТЗ, отслеживание.
3. Студент (Student): Работа над задачами.
4. Менеджер / Админ: Управление проектами и командами.

Бизнес-логика статусов: created -> taken -> testing -> done (или canceled).
Отвечай кратко, вежливо и по делу. Если не знаешь ответ, посоветуй обратиться к менеджеру через контакты.
"""

class MessageItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[MessageItem]

@router.post("/chat/ask")
async def chat_ask(request: ChatRequest) -> dict:
    """
    Эндпоинт для запросов к ИИ. Принимает историю диалога.
    """
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Ключ OpenRouter API не настроен на сервере")

    # Формируем итоговый список сообщений: системный промпт + история пользователя
    payload_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in request.messages:
        payload_messages.append({"role": msg.role, "content": msg.content})

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://it-incubator.subbota.tech", # Замени на свой домен
        "X-Title": "IT-Incubator Assistant",
        "Content-Type": "application/json"
    }

    # llama-3 бесплатная на OpenRouter для тестов, потом сменить на gemini-3.8-flash
    payload = {
        "model": "google/gemini-2.5-flash",
        "messages": payload_messages
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            data = response.json()
            reply = data["choices"][0]["message"]["content"]
            return {"reply": reply}
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Ошибка внешнего API: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ошибка при подключении к ИИ-серверу")