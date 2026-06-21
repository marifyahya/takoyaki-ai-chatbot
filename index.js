const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const { systemInstruction } = require("./systemInstruction");

app.post("/api/chat", async (req, res) => {
  try {
    const { history } = req.body;

    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "History tidak boleh kosong" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.5,
      },
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Error dari Gemini API:", error);

    if (error.status === 429) {
      return res.status(429).json({
        error:
          "Tunggu sebentar kak, dapur kami lagi sibuk banget nih (Rate Limit API). Coba ketik pesannya lagi dalam 1 menit ya!",
      });
    }

    res
      .status(500)
      .json({ error: "Terjadi kesalahan pada server. Coba lagi nanti." });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
