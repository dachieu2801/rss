const RSS = require('rss');

function createRssFeed(articles) {
    const feed = new RSS({
        title: 'News',
        description: 'Latest articles from News',
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
