import { Router } from "express";
import pool from "../utils/data.mjs";
import { isAuthenticated } from "../utils/middlewares.mjs";
import handleModelRequest from '../utils/llm.mjs';

const router = Router();


// Создание нового чата
router.post('/', isAuthenticated, async (req, res) => {
    try {
      const { title } = req.body;
      const userId = req.user.id;
  
      const chatResult = await pool.query(
        `INSERT INTO chatlogs (title) 
         VALUES ($1) 
         RETURNING id, title, created_at`,
        [title]
      );
  
      const chat = chatResult.rows[0];
      
      // Связываем чат с пользователем
      await pool.query(
        `INSERT INTO user_chatlogs (user_id, chatlog_id)
         VALUES ($1, $2)`,
        [userId, chat.id]
      );
  
      res.status(201).json({
        id: chat.id,
        title: chat.title,
        createdAt: chat.created_at
      });
    } catch (err) {
      console.error("Ошибка при создании чата:", err);
      res.status(500).json({ error: "Ошибка при создании чата" });
    }
  });

// Просмотр всех чатлогов пользователя
router.get("/user/:id", isAuthenticated, async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT c.* FROM chatlogs c
             JOIN user_chatlogs uc ON c.id = uc.chatlog_id
             WHERE uc.user_id = $1
             ORDER BY c.created_at DESC`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Ошибка при получении чатлогов:", err);
        res.status(500).json({ error: "Ошибка при получении чатлогов" });
    }
});

// Удаление всех чатлогов пользователя
router.delete("/user/:id", isAuthenticated, async (req, res) => {
    const userId = req.params.id;

    // Проверяем, что пользователь удаляет свои чатлоги
    if (req.user.id.toString() !== userId) {
        return res.status(403).json({ error: "Нельзя удалять чужие чатлоги" });
    }

    try {
        // Получаем все chatlog_id пользователя
        const chatlogsResult = await pool.query(
            "SELECT chatlog_id FROM user_chatlogs WHERE user_id = $1",
            [userId]
        );

        const chatlogIds = chatlogsResult.rows.map(row => row.chatlog_id);

        // Удаляем связи пользователя с чатлогами
        await pool.query(
            "DELETE FROM user_chatlogs WHERE user_id = $1",
            [userId]
        );

        // Удаляем сами чатлоги, если на них нет других ссылок
        await pool.query(
            `DELETE FROM chatlogs WHERE id = ANY($1) 
             AND NOT EXISTS (
                 SELECT 1 FROM user_chatlogs 
                 WHERE chatlog_id = ANY($1) 
                 AND user_id != $2
             )`,
            [chatlogIds, userId]
        );

        res.status(200).json({ message: "Все чатлоги пользователя успешно удалены" });
    } catch (err) {
        console.error("Ошибка при удалении чатлогов:", err);
        res.status(500).json({ error: "Ошибка при удалении чатлогов" });
    }
});

// удалить чат
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    // Проверяем, что чат принадлежит пользователю
    const accessCheck = await pool.query(
      'SELECT 1 FROM user_chatlogs WHERE user_id = $1 AND chatlog_id = $2',
      [userId, chatId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: "Нет доступа к чату" });
    }

    // Начинаем транзакцию
    await pool.query('BEGIN');

    // Удаляем все сообщения чата
    await pool.query('DELETE FROM messages WHERE chat_id = $1', [chatId]);

    // Удаляем связь пользователя с чатом
    await pool.query(
      'DELETE FROM user_chatlogs WHERE user_id = $1 AND chatlog_id = $2',
      [userId, chatId]
    );

    // Проверяем, есть ли другие пользователи у этого чата
    const otherUsers = await pool.query(
      'SELECT 1 FROM user_chatlogs WHERE chatlog_id = $1',
      [chatId]
    );

    // Если других пользователей нет - удаляем сам чат
    if (otherUsers.rows.length === 0) {
      await pool.query('DELETE FROM chatlogs WHERE id = $1', [chatId]);
    }

    await pool.query('COMMIT');
    res.status(200).json({ message: "Чат успешно удален" });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Ошибка при удалении чата:", err);
    res.status(500).json({ error: "Ошибка при удалении чата" });
  }
});

// Получение чатов пользователя с первым сообщением
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.title, 
        c.created_at,
        c.updated_at,
        (SELECT m.text FROM messages m 
         WHERE m.chat_id = c.id 
         ORDER BY m.created_at ASC LIMIT 1) as first_message
      FROM chatlogs c
      JOIN user_chatlogs uc ON c.id = uc.chatlog_id
      WHERE uc.user_id = $1
      ORDER BY c.updated_at DESC
    `, [req.user.id]);

    res.json(result.rows.map(row => ({
      id: row.id,
      title: row.title,
      firstMessage: row.first_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })));
  } catch (err) {
    console.error("Ошибка при получении чатов:", err);
    res.status(500).json({ error: "Ошибка при получении чатов" });
  }
});
  
// Получение сообщений чата 

router.get('/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          id, 
          text, 
          is_user as "isUser", 
          created_at as "timestamp" 
         FROM messages 
         WHERE chat_id = $1 
         ORDER BY created_at ASC`,
        [req.params.id]
      );
      
      res.json(result.rows);
    } catch (err) {
      console.error("Ошибка при получении сообщений:", err);
      res.status(500).json({ error: "Ошибка при получении сообщений" });
    }
  });
  
  // Добавление сообщения в чат
  router.post('/:chatId/messages', isAuthenticated, async (req, res) => {
    try {
      // Проверка доступа
      const access = await pool.query(
        'SELECT 1 FROM user_chatlogs WHERE user_id = $1 AND chatlog_id = $2',
        [req.user.id, req.params.chatId]
      );
      
      if (access.rows.length === 0) {
        return res.status(403).json({ error: "Нет доступа к чату" });
      }
  
      const { text, isUser } = req.body;
      
      const result = await pool.query(
        'INSERT INTO messages (chat_id, text, is_user) VALUES ($1, $2, $3) RETURNING *',
        [req.params.chatId, text, isUser]
      );
  
      // Обновляем время модификации чата
      await pool.query(
        'UPDATE chatlogs SET updated_at = NOW() WHERE id = $1',
        [req.params.chatId]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Ошибка при сохранении сообщения:", err);
      res.status(500).json({ error: "Ошибка при сохранении сообщения" });
    }
  });
  
// Обработка сообщения и генерация ответа
// Авторизованные пользователи
router.post('/:chatId/respond', isAuthenticated, async (req, res) => {
  const model = req.body.model || 'mistral'; // По умолчанию Mistral
  await handleModelRequest(req, res, model);
});


export default router;