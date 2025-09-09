import { Router } from 'express';
import Faq from '../models/Faq';
import Ticket from '../models/Ticket';
import ChatSession from '../models/ChatSession';
import ChatMessage from '../models/ChatMessage';
import MetricEvent from '../models/MetricEvent';
import { OpenAI } from 'openai';

const router = Router();

/**
 * Registra un evento de métrica. 
 * Se ignoran los errores para no afectar el flujo principal.
 */
async function recordEvent(type: string, data: any) {
  try {
    const event = new MetricEvent({ type, data });
    await event.save();
  } catch (err) {
    console.error('Error al registrar evento:', err);
  }
}

/**
 * GET /api/help/faq
 * Lista FAQs con búsqueda opcional (q) y paginación.
 */
router.get('/faq', async (req, res) => {
  try {
    const { q, page = '1', pageSize = '10' } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limit = parseInt(pageSize, 10);
    const filter = q ? { question: { $regex: q, $options: 'i' } } : {};
    const faqs = await Faq.find(filter)
      .skip((pageNum - 1) * limit)
      .limit(limit);
    await recordEvent('faq_viewed', { query: q });
    res.json(faqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar FAQs' });
  }
});

/**
 * POST /api/help/faq
 * Crea una nueva FAQ (uso interno, requiere permisos de admin).
 */
router.post('/faq', async (req, res) => {
  try {
    const { question, answer, tags } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Se requieren pregunta y respuesta' });
    }
    const faq = new Faq({ question, answer, tags });
    await faq.save();
    res.status(201).json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear FAQ' });
  }
});

/**
 * POST /api/help/ticket
 * Registra un ticket de contacto.
 */
router.post('/ticket', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nombre, email y mensaje son obligatorios' });
    }
    const ticket = new Ticket({ name, email, message });
    await ticket.save();
    await recordEvent('ticket_created', { ticketId: ticket._id, email });
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
});

/**
 * POST /api/help/chat/session
 * Crea una nueva sesión de chat y devuelve su ID.
 */
router.post('/chat/session', async (req, res) => {
  try {
    const session = new ChatSession({});
    await session.save();
    await recordEvent('chat_started', { sessionId: session._id });
    res.status(201).json({ sessionId: session._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear sesión' });
  }
});

/**
 * POST /api/help/chat/message
 * Guarda el mensaje del usuario, consulta ChatGPT y devuelve la respuesta.
 */
router.post('/chat/message', async (req, res) => {
  try {
    const { sessionId, userMsg } = req.body;
    if (!sessionId || !userMsg) {
      return res.status(400).json({ error: 'sessionId y userMsg son obligatorios' });
    }
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // Guardar el mensaje del usuario
    const userMessage = new ChatMessage({ sessionId, role: 'user', content: userMsg });
    await userMessage.save();

    // Recuperar el historial de la sesión
    const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
    const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));

    // Llamar a la API de OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: chatHistory,
      max_tokens: 300,
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content || 'Lo siento, no tengo respuesta.';
    const assistantMessage = new ChatMessage({ sessionId, role: 'assistant', content: reply });
    await assistantMessage.save();

    await recordEvent('chat_message_sent', { sessionId, userMsg });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

/**
 * GET /api/help/chat/:sessionId
 * Devuelve el historial completo de mensajes de una sesión.
 */
router.get('/chat/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al recuperar el historial' });
  }
});

/**
 * GET /api/help/metrics/summary
 * Devuelve un resumen de eventos de uso (puede restringirse a admins).
 */
router.get('/metrics/summary', async (req, res) => {
  try {
    const totalFaqViews   = await MetricEvent.countDocuments({ type: 'faq_viewed' });
    const totalTickets    = await MetricEvent.countDocuments({ type: 'ticket_created' });
    const totalChats      = await MetricEvent.countDocuments({ type: 'chat_started' });
    const totalMessages   = await MetricEvent.countDocuments({ type: 'chat_message_sent' });
    res.json({ totalFaqViews, totalTickets, totalChats, totalMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

export default router;
