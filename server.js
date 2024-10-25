const express = require('express');
const crawlWebsite = require('./crawler');
const createRssFeed = require('./rssFeed');
const cron = require('node-cron');
const fs = require('fs');
const RSS = require('rss');

const app = express();
const PORT = 3001;

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
    const authFeeds = feed.threads
    
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
            description: item.description.substring(0, 100) + '...',
            guid: item.id,
            // url: item.previewImage || '' ,
            link: `https://community.lexinfocus.com/threads/${item.id}`,
        });
    });
    
    res.set('Content-Type', 'application/rss+xml');
    res.send(rss.xml());
});

//apikey js5emaahufb4hzstxut2ni69z4wxmk4e
//campaint id: jSb2F
//fromFieldId: zXTFR, zX48q
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
