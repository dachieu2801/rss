const express = require('express');
const crawlWebsite = require('./crawler');
const createRssFeed = require('./rssFeed');
const cron = require('node-cron');
const fs = require('fs');
const RSS = require('rss');

const app = express();
const PORT = 3001;

// app.get('/', async (req, res) => {
//     const articles = await crawlWebsite();
//     const rssFeed = createRssFeed(articles);
//     fs.writeFileSync('feed.xml', rssFeed); 
//     res.set('Content-Type', 'application/rss+xml');
//     res.send(rssFeed);
// });
app.get('/', async (req, res) => {
    const response = await fetch('https://community.lexinfocus.com/api/52831/sign-in',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'ankhieu322@gmail.com',
            password: 'hieuha2801',
        }),
    });
    
    const loginJson = await response.json();

    const getFeed = await fetch('https://community.lexinfocus.com/api/52831/threads?c=null&f=null',{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Estage-Authorization': loginJson?.user?.access_token || ""
        },
    });
    const feed = await getFeed.json();
    const authFeeds = feed.threads.filter((item) => item.author_id == 14066)//loginJson?.user?.id);
    
    const rss = new RSS({
        title: 'Your Feed Title',
        description: 'Your Feed Description',
        // feed_url: 'https://yourdomain.com/rss',
        // site_url: 'https://yourdomain.com',
        language: 'en',
    });
    authFeeds.forEach(item => {
        rss.item({
            title: item.title,
            description: item.description,
            guid: item.id,
            previewImage: item.previewImage || '' 
        });
    });
    
    res.set('Content-Type', 'application/rss+xml');
    res.send(rss.xml());
});

// // Cron job để crawl nội dung định kỳ
// cron.schedule('0 */2 * * *', async () => {
//     const articles = await crawlWebsite();
//     const rssFeed = createRssFeed(articles);
//     fs.writeFileSync('feed.xml', rssFeed);
//     console.log('Crawled new content and updated RSS feed');
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
