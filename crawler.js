const axios = require('axios');
const cheerio = require('cheerio');

async function crawlWebsite() {
    const url = 'https://news.ycombinator.com'; 
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const articles = [];
    $('tr.athing').each((index, element) => {
        const span = $(element).find('span.titleline');
        const title = $(span).find('a').text().trim();
        const link = $(span).find('a').attr('href');
        articles.push({ title, link });
    });

    return articles;
}

module.exports = crawlWebsite;
