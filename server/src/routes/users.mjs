import { Router } from "express";
import pool from "../utils/data.mjs";
import passport from "passport";
import "../strategies/local-strategy.mjs";
import bcrypt from "bcrypt";
import { isAuthenticated } from "../utils/middlewares.mjs";

const router = Router();


// регистрация
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Проверка уникальности username
      const userExists = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: "Имя пользователя уже занято" });
      }
  
      // Хэширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Создание пользователя
      const result = await pool.query(
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
        [username, hashedPassword]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Ошибка при создании пользователя:", err);
      res.status(500).json({ error: "Ошибка при создании пользователя" });
    }
  });

  // Изменение пароля
router.put("/change-password", isAuthenticated, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
  
    try {
      // Получаем текущий пароль пользователя
      const result = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
  
      const currentPasswordHash = result.rows[0].password;
  
      // Проверяем, совпадает ли старый пароль
      const isPasswordValid = await bcrypt.compare(oldPassword, currentPasswordHash);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Неверный старый пароль" });
      }
  
      // Хэшируем новый пароль
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
  
      // Обновляем пароль
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [newPasswordHash, userId]);
  
      res.status(200).json({ message: "Пароль успешно изменён" });
    } catch (err) {
      console.error("Ошибка при изменении пароля:", err);
      res.status(500).json({ error: "Ошибка при изменении пароля" });
    }
  });

// Вход в аккаунт
router.post("/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json({ message: "Успешный вход", user: req.user });
});

// Выход из профиля
router.post("/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Ошибка при выходе из профиля" });
      }
      res.status(200).json({ message: "Успешный выход" });
    });
  });


export default router;