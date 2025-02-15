import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// מוודא שיש טוקן
const UW_TOKEN = process.env.UW_TOKEN;
if (!UW_TOKEN) {
    console.error("⚠️ שגיאה: משתנה הסביבה UW_TOKEN לא מוגדר!");
    process.exit(1);
}

// שימוש ב-CORS כדי לאפשר גישה מהדפדפן
app.use(cors());

// רשימת ה-endpoints שנבחרו
const endpoints = [
    "option-trades/flow-alerts",
    "stock/{ticker}/option-contracts",
    "option-contract/{id}/flow",
    "stock/{ticker}/oi-change",
    "stock/{ticker}/option/volume-oi-expiry",
    "darkpool/recent",
    "darkpool/{ticker}",
    "insider/{ticker}/ticker-flow",
    "market/insider-buy-sells",
    "insider/{sector}/sector-flow",
    "market/market-tide",
    "market/spike",
    "market/sector-etfs",
    "market/{ticker}/etf-tide",
    "etfs/{ticker}/holdings",
    "stock/{ticker}/greek-flow",
    "stock/{ticker}/greeks",
    "stock/{ticker}/max-pain",
    "stock/{ticker}/nope",
    "stock/{ticker}/info",
    "seasonality/market",
    "seasonality/{month}/performers",
    "earnings/afterhours",
    "earnings/premarket",
    "earnings/{ticker}"
];

// יצירת הנתיבים בפרוקסי
endpoints.forEach(endpoint => {
    app.get(`/api/${endpoint}`, async (req, res) => {
        try {
            let apiUrl = `https://api.unusualwhales.com/api/${endpoint}`;

            // מחליף {ticker}, {month}, {id} בפרמטרים שנשלחו בבקשה
            Object.keys(req.params).forEach(param => {
                apiUrl = apiUrl.replace(`{${param}}`, req.params[param]);
            });

            const fetchOptions = {
                method: "GET",
                headers: { "Authorization": `Bearer ${UW_TOKEN}` }
            };

            const uwResponse = await fetch(apiUrl, fetchOptions);
            const data = await uwResponse.json();

            res.status(uwResponse.status).json(data);
        } catch (err) {
            console.error(`Proxy error on ${endpoint}:`, err);
            res.status(500).json({ error: "Proxy error: " + err.message });
        }
    });
});

// בריאות השרת
app.get("/", (req, res) => {
    res.json({ status: "✅ Proxy is running!" });
});

// הפעלת השרת
app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on port ${PORT}`);
});
