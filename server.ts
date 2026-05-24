import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Stock Data Proxy (Simulation/Real)
  // For the demo, we'll simulate real-time movement to avoid API limit issues
  // but provide a structure that can easily use a real API.
  app.get("/api/stock/:symbol", async (req, res) => {
    const { symbol } = req.params;
    
    // Simulate real-time data for the demo to ensure it always works
    // In a real app, you'd fetch from https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}
    const basePrice = symbol === "AAPL" ? 180 : symbol === "TSLA" ? 170 : symbol === "MSFT" ? 400 : 100;
    const volatility = basePrice * 0.02;
    const currentPrice = basePrice + (Math.random() - 0.5) * volatility;
    
    res.json({
      symbol,
      price: currentPrice.toFixed(2),
      change: (Math.random() * 2 - 1).toFixed(2),
      timestamp: new Date().toISOString(),
      volume: Math.floor(Math.random() * 1000000),
    });
  });

  // API Route: Fetch News (Simulation/Real)
  app.get("/api/news/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const newsTemplates = [
      `{symbol} displays strong quarterly growth amidst tech rally.`,
      `Investors cautious about {symbol} upcoming regulatory changes.`,
      `New AI integration boosts {symbol} market outlook.`,
      `Competition intensifies for {symbol} in the global sector.`,
      `Analysts upgrade {symbol} to 'Strong Buy' after recent performance.`
    ];
    
    const count = 3;
    const news = Array.from({ length: count }).map(() => ({
      title: newsTemplates[Math.floor(Math.random() * newsTemplates.length)].replace("{symbol}", symbol),
      source: "MarketWatch",
      time: new Date().toISOString()
    }));
    
    res.json(news);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
