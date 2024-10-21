const RSS = require('rss');

function createRssFeed(articles) {
    const feed = new RSS({
        title: 'Hacker News',
        description: 'Latest articles from Hacker News',
        site_url: 'https://news.ycombinator.com/',
        language: 'en',
    });

    // articles.forEach(article => {
    //     feed.item({
    //         title: articles.title,
    //         description: articles.title,
    //         url: articles.link,
    //         guid: articles.link,
    //         date: new Date(),
    //     });
    // });

    return feed.xml({ indent: true });
}

module.exports = createRssFeed;
