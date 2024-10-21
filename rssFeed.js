const RSS = require('rss');

function createRssFeed(articles) {
    const feed = new RSS({
        title: 'Hacker News',
        description: 'Latest articles from Hacker News',
        site_url: 'https://news.ycombinator.com/',
        language: 'en',
    });

    articles.forEach(article => {
        feed.item({
            title: article.title,
            description: article.title,
            url: article.link,
            guid: article.link,
            date: new Date(),
        });
    });

    return feed.xml({ indent: true });
}

module.exports = createRssFeed;
