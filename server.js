import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ בדיקה שהטוקן מוגדר
const UW_TOKEN = process.env.UW_TOKEN;
if (!UW_TOKEN) {
    console.error("⚠️ שגיאה: משתנה הסביבה UW_TOKEN לא מוגדר!");
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// ✅ פונקציה שמגבילה את כמות הנתונים המוחזרת ומוסיפה מידע לדפדוף
const limitResponseSize = (data, limit = 10, offset = 0) => {
    if (Array.isArray(data)) {
        const total = data.length;
        const slicedData = data.slice(offset, offset + limit);
        return {
            results: slicedData,
            limit,
            offset,
            has_more: offset + limit < total // ✅ אם יש עוד מידע
        };
    }
    return data;
};

// ✅ רשימת הנתיבים הנתמכים
const endpoints = [
    "option-trades/flow-alerts",
    "darkpool/:ticker",
    "stock/:ticker/max-pain",
    "market/market-tide"
];

// ✅ יצירת הנתיבים בשרת
endpoints.forEach(endpoint => {
    app.get(`/api/${endpoint}`, async (req, res) => {
        try {
            let apiUrl = `https://api.unusualwhales.com/api/${endpoint}`;

            // מחליף משתנים דינמיים (כגון :ticker ו-:id) בפרמטרים מהבקשה
            Object.keys(req.params).forEach(param => {
                apiUrl = apiUrl.replace(`:${param}`, req.params[param]);
            });

            console.log(`🔗 Fetching: ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: { "Authorization": `Bearer ${UW_TOKEN}` }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            let data = await response.json();

            // ✅ הגבלת נתונים כדי שה-GPT יוכל לעבוד עם זה
            const limit = parseInt(req.query.limit) || 10; // ברירת מחדל 10 תוצאות
            const offset = parseInt(req.query.offset) || 0;
            data = limitResponseSize(data, limit, offset);

            res.status(response.status).json(data);
        } catch (err) {
            console.error(`❌ Proxy error:`, err);
            res.status(500).json({ error: "Proxy error: " + err.message });
        }
    });
});

// ✅ בריאות השרת
app.get("/", (req, res) => {
    res.json({ status: "✅ Proxy is running!" });
});

// ✅ הפעלת השרת
app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on port ${PORT}`);
});
