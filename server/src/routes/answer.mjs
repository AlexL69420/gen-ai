import { Router } from 'express';
import handleModelRequest from '../utils/llm.mjs';


const router = Router();

// Неавторизованные пользователи
router.post('/', async (req, res) => {
  await handleModelRequest(req, res, 'tinyllama'); // Для гостей только TinyLlama
});


export default router;