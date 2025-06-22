// index.js (für den Unflare-Server)
import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const app = express();
app.use(express.json());

puppeteer.use(StealthPlugin());

app.post('/scrape', async (req, res) => {
  const { url, timeout = 60000 } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL fehlt' });
  }

  try {
    console.log(`🌍 Starte Unflare-Scraping für: ${url}`);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    await page.waitForTimeout(8000); // Warte ggf. auf Inhalte

    const html = await page.content();
    await browser.close();

    console.log(`✅ HTML erfolgreich geladen (${html.length} Zeichen)`);
    res.send(html);
  } catch (err) {
    console.error(`❌ Fehler im Unflare-Scraper:`, err.message);
    res.status(500).json({ error: 'Scraping fehlgeschlagen', details: err.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Unflare-Server läuft auf Port ${PORT}`);
});
