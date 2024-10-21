const express = require('express');
const crawlWebsite = require('./crawler');
const createRssFeed = require('./rssFeed');
const cron = require('node-cron');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Đường dẫn để truy cập RSS feed
app.get('/rss', async (req, res) => {
    const articles = await crawlWebsite();
    const rssFeed = createRssFeed(articles);
    fs.writeFileSync('feed.xml', rssFeed); // Lưu feed vào file
    res.set('Content-Type', 'application/rss+xml');
    res.send(rssFeed);
});

// Cron job để crawl nội dung định kỳ
cron.schedule('0 */2 * * *', async () => {
    const articles = await crawlWebsite();
    const rssFeed = createRssFeed(articles);
    fs.writeFileSync('feed.xml', rssFeed);
    console.log('Crawled new content and updated RSS feed');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
