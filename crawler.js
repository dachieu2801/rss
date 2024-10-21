const axios = require('axios');
const cheerio = require('cheerio');

async function crawlWebsite() {
    const url = 'https://news.ycombinator.com'; // URL của Hacker News
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const articles = [];
    $('tr.athing').each((index, element) => {
        const title = $(element).find('a.storylink').text();
        const link = $(element).find('a.storylink').attr('href');
        articles.push({ title, link });
    });

    return articles;
}

module.exports = crawlWebsite;
