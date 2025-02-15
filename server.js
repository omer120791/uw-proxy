import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Bearer Token של Unusual Whales
const UW_TOKEN = process.env.UW_TOKEN || "b03b587e-0799-4957-a2a0-e4ba10397581";

// מגיש את `ai-plugin.json`
app.get('/.well-known/ai-plugin.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai-plugin.json'));
});

// Proxy לכל קריאה שמתחילה ב- /api
app.use('/api', async (req, res) => {
  try {
    const subpath = req.url; // לדוגמה: /darkpool/recent
    const uwURL = `https://api.unusualwhales.com/api${subpath}`;

    const fetchOptions = {
      method: req.method,
      headers: { "Authorization": `Bearer ${UW_TOKEN}` }
    };

    const uwResponse = await fetch(uwURL, fetchOptions);
    res.status(uwResponse.status);
    const data = await uwResponse.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
