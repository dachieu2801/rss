const RSS = require('rss');

function createRssFeed(articles) {
    const feed = new RSS({
        title: 'Forum',
        description: 'Latest articles from Forum',
        feed_url: 'https://example.com/rss.xml',
        site_url: 'https://example.com',
        pubDate: new Date().toUTCString()
    });

    articles.forEach(article => {
        
        feed.item({
            guid: article.id,
            title: article.title,
            description: article.description,
            enclosure: {
                url: article.previewImage,
            },
            pubDate: updateTimestamp.toUTCString(),
        });
    });

    return feed.xml({ indent: true });
}

module.exports = createRssFeed;
