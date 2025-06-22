// index.js für Unflare (angepasst)
import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const app = express();
app.use(express.json());
puppeteer.use(StealthPlugin());

const PORT = process.env.PORT || 5002;

app.post('/scrape', async (req, res) => {
  const { url, timeout = 60000 } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  let browser;

  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    console.log(`✅ Seite geladen: ${url}`);

    // Optional warten bis Turnstile angezeigt wurde
    const hasTurnstile = await page.$('iframe[src*="turnstile"]');
    if (hasTurnstile) {
      console.log('⏳ Turnstile-Element gefunden – warte auf manuellen Ladevorgang oder Timeout...');
      for (let i = 0; i < 15; i++) {
        console.log(`🔄 Warte... (${i + 1}s)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const content = await page.content();
    res.send(content);

  } catch (err) {
    console.error('❌ Fehler im Unflare-Scraper:', err);
    res.status(500).json({ error: err.toString() });

  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Unflare Scraper bereit auf Port ${PORT}`);
});
