import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { LOCAL_API_URL } from "../environment";
import dataFormatter from "../services/dataFormatter";

interface Chat {
  id: number;
  title: string;
  firstMessage: string;
  createdAt: string;
  updatedAt?: string;
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string; // Форматированная строка даты
  rawTimestamp?: string; // Опционально: оригинальная метка времени
}

interface ChatProps {
  chatId?: number | null;
  onNewChatCreated?: (chat: Chat) => void;
  onChatChange?: (chatId: number | null) => void;
}

//тип для моделей
type ModelType = "tinyllama" | "mistral" | "phi3";

export default function Chat({
  chatId,
  onNewChatCreated,
  onChatChange,
}: ChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(
    chatId || null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState<
    "tinyllama" | "mistral" | "phi3"
  >("mistral");

  useEffect(() => {
    setCurrentChatId(chatId || null);
  }, [chatId]);

  useEffect(() => {
    if (currentChatId !== null) {
      loadChatMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const loadChatMessages = async (id: number) => {
    try {
      const response = await axios.get<ChatMessage[]>(
        `${LOCAL_API_URL}api/chatlogs/${id}/messages`,
        { withCredentials: true },
      );

      // Форматирование даты сообщений
      const formattedMessages = response.data.map((msg) => ({
        ...msg,
        timestamp: dataFormatter(msg.timestamp),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Ошибка при загрузке сообщений:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const tempMessageId = Date.now();
    const newMessage: ChatMessage = {
      id: tempMessageId,
      text: message,
      isUser: true,
      timestamp: dataFormatter(new Date()),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      let chatIdToUpdate = currentChatId;

      if (!currentChatId && user) {
        // Создание чата только для авторизованных пользователей
        const chatTitle =
          message.length > 50 ? `${message.substring(0, 47)}...` : message;

        const chatResponse = await axios.post<{ id: number }>(
          `${LOCAL_API_URL}api/chatlogs/`,
          { title: chatTitle },
          { withCredentials: true },
        );

        chatIdToUpdate = chatResponse.data.id;
        setCurrentChatId(chatIdToUpdate);

        const newChat: Chat = {
          id: chatIdToUpdate,
          title: chatTitle,
          firstMessage: message,
          createdAt: new Date().toISOString(),
        };

        if (onNewChatCreated) onNewChatCreated(newChat);
        if (onChatChange) onChatChange(chatIdToUpdate);
      }

      if (user) {
        // Логика для авторизованных пользователей
        if (chatIdToUpdate !== null) {
          await axios.post(
            `${LOCAL_API_URL}api/chatlogs/${chatIdToUpdate}/messages`,
            { text: message, isUser: true },
            { withCredentials: true },
          );

          const botResponse = await axios.post(
            `${LOCAL_API_URL}api/chatlogs/${chatIdToUpdate}/respond`,
            { message, model: selectedModel },
            { withCredentials: true },
          );

          const botMessage: ChatMessage = {
            id: Date.now() + 1,
            text: botResponse.data.reply,
            isUser: false,
            timestamp: dataFormatter(new Date()),
          };

          setMessages((prev) => [
            ...prev.filter((m) => m.id !== tempMessageId),
            {
              ...newMessage,
              id: Date.now() + 1,
            },
            botMessage,
          ]);

          await axios.post(
            `${LOCAL_API_URL}api/chatlogs/${chatIdToUpdate}/messages`,
            { text: botResponse.data.reply, isUser: false },
            { withCredentials: true },
          );
        }
      } else {
        // Логика для неавторизованных пользователей
        const botResponse = await axios.post(`${LOCAL_API_URL}api/answer/`, {
          message,
        });

        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          text: botResponse.data.reply,
          isUser: false,
          timestamp: dataFormatter(new Date()),
        };

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempMessageId),
          {
            ...newMessage,
            id: Date.now() + 1,
          },
          botMessage,
        ]);
      }
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessageId));
    } finally {
      setIsLoading(false);
    }
  };
  // Автопрокрутка к новому сообщению
  /*
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  */

  return (
    <main className="flex h-[calc(100vh-6rem)] w-3/5 flex-col rounded bg-gradient-to-r from-blue-100 to-blue-500 px-2 py-3 text-black dark:from-violet-400 dark:to-violet-800 dark:text-white">
      {/* Панель выбора модели (только для авторизованных) */}
      {user && (
        <div className="flex justify-center gap-2 p-2">
          {Object.entries({
            tinyllama: "TinyLlama (1.1B)",
            phi3: "Phi-3 (3.8B)",
            mistral: "Mistral (7B)",
          }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedModel(key as ModelType)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors hover:cursor-pointer ${
                selectedModel === key
                  ? "bg-blue-600 text-white dark:bg-violet-600"
                  : "bg-white text-gray-800 hover:bg-blue-100 dark:bg-violet-800 dark:hover:bg-violet-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {/* Контейнер сообщений с фиксированной высотой и скроллом */}
      <div className="scrollbar-light scrollbar-dark flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.isUser ? "bg-blue-600 text-white dark:bg-violet-600" : "bg-white text-gray-800"}`}
              >
                <p className="break-words">{msg.text}</p>
                <p className="text-xs opacity-70">{msg.timestamp}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-white px-4 py-2 text-gray-800">
                <p className="italic">ожидание ответа...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Поле ввода */}
      <div className="flex w-full items-center gap-2 p-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Введите сообщение..."
          className="flex-1 rounded-lg border border-blue-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-violet-600 dark:bg-violet-800"
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          className={`rounded-lg px-4 py-2 font-medium ${!message.trim() || isLoading ? "cursor-not-allowed bg-gray-300" : "border-2 border-slate-300 bg-blue-600 text-white hover:cursor-pointer hover:bg-blue-700 dark:bg-violet-800 dark:hover:bg-violet-600"}`}
        >
          Отправить
        </button>
      </div>
    </main>
  );
}
