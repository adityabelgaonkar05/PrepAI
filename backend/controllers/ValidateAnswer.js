const User = require('../models/UserModel');
const PdfContent = require('../models/PdfContentModel');
const resolveTokens = require('../utils/resolveTokens');
const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

exports.validateAnswer = async (req, res) => {
  try {
    const { question, pdfContentId, answer, token } = req.body;

    if (!question || !pdfContentId || !answer || !token) {
      return res.status(400).json({ error: 'question, pdfContentId and answer are required' });
    }

    const { objectId, expiryDate } = resolveTokens(token);

    if (!objectId || !expiryDate) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const currentDate = new Date();

    if (currentDate > expiryDate) {
        return res.status(401).json({ error: 'Token has expired' });
    }

    const user = await User.findById(objectId);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    const pdfContent = await PdfContent.findById(pdfContentId);
    if (!pdfContent) {
      return res.status(404).json({ error: 'Pdf content not found' });
    }

    const prompt = `You are given the content of a PDF and a question, along with a proposed answer. Determine if the answer is correct based on the PDF content. Respond with strict JSON: {"verdict":"yes" or "no","feedback":"< concise feedback under 100 words>"}.\n\nQuestion: ${question}\nProvided Answer: ${answer}\n\nPDF Content:\n${pdfContent.content.slice(0, 300000)}`;

    const geminiResponse = await axios.post(
      GEMINI_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 1024, topP: 1 }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    let raw = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (raw.startsWith('```json')) {
      raw = raw.replace(/```json\s*|\s*```/g, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse Gemini response', raw });
    }

    let { verdict, feedback } = parsed;
    verdict = typeof verdict === 'string' ? verdict.toLowerCase() : verdict;
    if (verdict !== 'yes' && verdict !== 'no') {
      verdict = verdict === 'true' ? 'yes' : 'no';
    }

    return res.json({ verdict, feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};
