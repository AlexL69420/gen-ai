import { Ollama } from 'ollama';
const ollama = new Ollama({ host: 'http://localhost:11434' });

// Доступные модели с параметрами
const MODELS = {
  tinyllama: {
    name: 'TinyLlama 1.1B',
    params: { temperature: 0.3, num_predict: 200 }
  },
  mistral: {
    name: 'Mistral 7B',
    params: { temperature: 0.7, num_predict: 500 }
  },
  phi3: {
    name: 'Phi-3-mini 3.8B',
    params: { temperature: 0.5, num_predict: 300 }
  }
};

// Общий обработчик для всех моделей
async function handleModelRequest(req, res, modelKey) {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Сообщение не может быть пустым" });
    }

    const model = MODELS[modelKey];
    if (!model) {
      return res.status(400).json({ error: "Неверная модель" });
    }

    const response = await ollama.generate({
      model: modelKey,
      prompt: `Пользователь: ${message}\nАссистент:`,
      stream: false,
      options: model.params
    });

    const cleanReply = response.response.replace(/^Ассистент:\s*/i, '').trim();
    
    res.json({ 
      reply: cleanReply,
      model: model.name,
      tokens: response.done ? response.eval_count : null
    });
    
  } catch (err) {
    console.error(`[${modelKey} error]:`, err);
    res.status(500).json({ 
      error: "Ошибка генерации",
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
}

export default handleModelRequest;