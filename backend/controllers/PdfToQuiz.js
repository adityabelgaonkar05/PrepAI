const PdfContent = require('../models/PdfContentModel');
const Quiz = require('../models/QuizModel');
const pdfParse = require('pdf-parse');
const { createHash } = require('crypto');
const axios = require('axios');
const resolveTokens = require('../utils/resolveTokens');
require('dotenv').config();
const getNanoid = async () => {
  const { nanoid } = await import('nanoid');
  return nanoid;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

exports.processPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const buffer = req.file.buffer;
        const hashKey = createHash('sha256').update(buffer).digest('hex');

        let pdfContent = await PdfContent.findOne({ hashedKey: hashKey });

        if (!pdfContent) {
            const data = await pdfParse(buffer);
            const text = data.text;
            pdfContent = await PdfContent.create({ hashedKey: hashKey, content: text });
        }

        const prompt = `You are given the content of a PDF. Based on it, generate the following structured JSON:

{
  "quizContent": [
    {
      "question": "string",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B"
    },
    ...
  ],
  "textQuestions": [
    "Question 1 as a string",
    "Question 2 as a string"
  ]
}

Guidelines:
- quizContent must be an array of at least 3 MCQs.
- Each question should be fact-based and relevant to the content.
- Each options array must contain exactly 4 concise choices.
- Only one answer per question.
- textQuestions should be short-answer or discussion-style questions based on the content.

Here is the PDF content:
${pdfContent.content.slice(0, 10000)}
`;

        const geminiResponse = await axios.post(
            GEMINI_URL,
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topP: 1,
                    topK: 40
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        let rawText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (rawText.startsWith('```json')) {
            rawText = rawText.replace(/```json\s*|\s*```/g, '');
        }

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch (e) {
            return res.status(500).json({ error: 'Failed to parse Gemini response', raw: rawText });
        }

        const { quizContent, textQuestions } = parsed;
        const { title, token } = req.body;

        const { objectId, expiryDate } = resolveTokens(token);
        if (!objectId || !expiryDate) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const currentDate = new Date();
        if (currentDate > expiryDate) {
            return res.status(401).json({ error: 'Token has expired' });
        }

        const authorId = objectId;

        if (!title || !authorId) {
            return res.status(400).json({ error: 'title and authorId are required' });
        }

        let link_code;
        let nanoidFn = await getNanoid();
        do {
            link_code = nanoidFn(10);
        } while (await Quiz.findOne({ link_code }));

        const quiz = await Quiz.create({
            pdfContentId: pdfContent._id,
            Title: title,
            author: authorId,
            quizContent,
            textQuestions,
            link_code
        });

        await quiz.save();
        return res.json({ link_code });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};
