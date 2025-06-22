import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const port = process.env.PORT || 5002;

app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url, timeout = 60000 } = req.body;

  console.log(`📥 Anfrage erhalten für URL: ${url}`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    console.log('🌐 Öffne Seite...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });

    console.log('📄 Extrahiere HTML...');
    const content = await page.content();

    await browser.close();

    console.log('✅ HTML erfolgreich extrahiert.');
    res.send(content);
  } catch (error) {
    console.error('❌ Fehler beim Scraping:', error);
    res.status(500).send({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('🟢 Unflare Scraper läuft.');
});

app.listen(port, () => {
  console.log(`🚀 Server läuft auf Port ${port}`);
});
