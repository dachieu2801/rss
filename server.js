const express = require('express');
const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get('/rss-feeds', async (req, res) => {

    try {
        const filePath = path.join(__dirname, 'admin.json');

        const setting = await new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return reject("Error reading admin.json file");
                }
                try {
                    resolve(JSON.parse(data));
                } catch (parseErr) {
                    reject({
                        message: "Error parsing admin.json file"
                    });
                }
            });
        });

        if (!setting || !setting.email || !setting.password) {
            throw new Error('Missing email or password');
        }

        const response = await fetch('https://community.lexinfocus.com/api/52831/sign-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: setting.email, password: setting.password }),
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.statusText}`);
        }

        const loginJson = await response.json();

        const getFeed = await fetch('https://community.lexinfocus.com/api/52831/threads?c=null&f=null', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Estage-Authorization': loginJson?.user?.access_token || ""
            },
        });

        if (!getFeed.ok) {
            throw new Error(`Failed to fetch feeds: ${getFeed.statusText}`);
        }

        const feed = await getFeed.json();
        const authFeeds = feed.threads;

        const rss = new RSS({
            title: 'NotifyHub',
            description: 'NotifyHub Description',
            language: 'en',
        });

        authFeeds.forEach(article => {
            rss.item({
                title: article.title,
                description: article.description.substring(0, 150) + '...',
                guid: article.id,
                url: 'https://community.lexinfocus.com/' + article.id,
            });
        });

        res.set('Content-Type', 'application/rss+xml');
        res.send(rss.xml());

    } catch (error) {
        res.send(`
            <html>
                <head>
                    <title>Error</title>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f9;
                            text-align: center;
                        }
                        .container {
                            max-width: 400px;
                        }
                        h2 {
                            color: red;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>An error occurred</h2>
                        <p>${error.message}</p>
                    </div>
                </body>
            </html>
        `);
    }
});

app.get('/', (req, res) => {


    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NotifyHub</title>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                }
                .login-container {
                    width: 300px;
                    padding: 2rem;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    background-color: #fff;
                    text-align: center;
                }
                .login-container h1 {
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                    color: #333;
                }
                .login-container input[type="email"],
                .login-container input[type="password"] {
                    width: 100%;
                    padding: 0.5rem;
                    margin: 0.5rem 0;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .login-container button {
                    width: 100%;
                    padding: 0.5rem;
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    font-size: 1rem;
                    cursor: pointer;
                }
                .login-container button:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h1>NotifyHub</h1>
                <form action="/admin" method="POST">
                    <input type="email" name="email" placeholder="Email" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/admin', async (req, res) => {
    const setting = req.body;

    if (!setting.email || !setting.password) {
        return res.status(400).send('Missing email or password');
    }
    const filePath = path.join(__dirname, 'admin.json');
    fs.writeFile(filePath, JSON.stringify(setting, null, 2), (writeErr) => {
        if (writeErr) {
            console.error(writeErr);
            return res.status(500).send('Error saving data');
        }
        res.send('Login successful');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
