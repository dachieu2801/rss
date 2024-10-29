const express = require('express');
const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const session = require('express-session');

const app = express();
const PORT = 3001;

const REQUEST_LIMIT = 100;
let email = "ankhieu322@gmail.com"

let settings = {};
let sessionSecret =  "Ki8fXkvYneOaVoRb"

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 600000 * 60 } 
    })
);
const filePath = path.join(__dirname, 'admin.json');

const loadSettings = async () => {
    const setting = fs.readFileSync(filePath, 'utf8');
    if (setting) {
        settings = JSON.parse(setting);
    }
};
loadSettings();

//style
const buttonStyle =`
    button {
        width: 100%;
        padding: 0.5rem;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
    }
    button:hover {background-color: #0056b3;}
`
const inputStyle = `
    input{
        width: 100%;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border: 1px solid #ddd;
        border-radius: 4px; 
   }
`

// Middleware to track requests and check limit
const limitMiddleware = (req, res, next) => {
    if (settings.isAuthenticated) {
        return next();
    }
    if (settings.requestCount >= REQUEST_LIMIT) {
        return res.status(403).send(`
            <html>
                <head><title>Password Required</title>
                <style>
                ${buttonStyle}
                </style>
                </head>
                <body style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
                    <div>
                        <h2 style="color: red;">Request limit reached.</h2>
                        <p>Please contact <strong>${email}</strong> for assistance, or enter the provided password to continue.</p>
                        <form method="POST" action="/verify-password">
                            <input type="password" name="access_key" placeholder="Enter access key" required />
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </body>
            </html>
        `);
    }
    settings.requestCount += 1;
    console.log(`Request count: ${settings.requestCount}`);
    next();
};
// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.send(`
        <html>
            <head><title>Password App</title>
            <style>
                ${buttonStyle}
                ${inputStyle}
            </style>
            </head>
            <body style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
                <div>
                    <h2>Điền mật khẩu app để có thể sử dụng tính năng này</h2>
                    <form method="POST" action="/passwordApp">
                        <input type="password" name="password" placeholder="Enter password" required />
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </body>
        </html>
    `);
};

app.get('/rss-feeds', limitMiddleware, async (req, res) => {
    try {
        if (!settings || !settings.email || !settings.password) {
            throw new Error('Missing email or password');
        }
        const response = await fetch('https://community.lexinfocus.com/api/52831/sign-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: settings.email, password: settings.password }),
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
        authFeeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        authFeeds.forEach(article => {
            rss.item({
                title: article.title,
                description: article.description.substring(0, 150) + '...',
                guid: article.id,
                pubDate: article.timestamp,
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

app.post('/verify-password', (req, res) => {
    const { access_key } = req.body;
    const hashedInput = crypto.createHash('sha256').update(access_key).digest('hex');
    if (hashedInput === settings.access_key) {
        isAuthenticated = true;
        res.send('<h2>Password accepted. Request limit is now disabled.</h2>');
    } else {
        res.send('<h2 style="color:red;">Incorrect password. Access denied.</h2>');
    }
})

// Route to handle passwordApp form submission
app.post('/passwordApp', (req, res) => {
    const { password } = req.body;
    const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
    console.log(hashedInput);
    if (hashedInput == settings.passwordApp) {
        req.session.isAuthenticated = true;
        res.redirect('/');
    } else {
        res.send(`
            <html>
                <head><title>Password App</title>
                <style>
                    ${buttonStyle}
                    ${inputStyle}
                </style>
                </head>
                <body style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
                    <div>
                        <h2  style="margin:0;padding:0;">Điền mật khẩu app để có thể sử dụng tính năng này</h2>
                        <p  style="color:red;">Sai mật khẩu</p>
                        <form method="POST" action="/passwordApp">
                            <input type="password" name="password" placeholder="Enter password" required />
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </body>
            </html>
        `);
    }
});

app.get('/',requireAuth,  (req, res) => {
    const query = req.query;
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
                ${inputStyle}
                ${buttonStyle}
            </style>
        </head>
        <body>
            <div class="login-container">
                <h1>NotifyHub</h1>
                <p style="color:#27A4F2; margin:0;padding:0; font-size:16px" >${query?.success ? 'Cập nhật thành công' : ''}</p>
                <form action="/admin" method="POST">
                    <input type="email" name="email" value="${settings.email}" placeholder="Email" required>
                    <input type="password" value="${settings.password}" name="password" placeholder="Password" required>
                    <input type="password" name="passwordApp" placeholder="Password App">
                    <button type="submit">Submit</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/admin',requireAuth , async (req, res) => {
    const setting = req.body;

    if (!setting.email || !setting.password) {
        return res.status(400).send('Missing email or password');
    } else {
        settings.email = setting.email.trim();
        settings.password = setting.password.trim();
    }
    if (setting.passwordApp.trim()) {
        const hashedInput = crypto.createHash('sha256').update(setting.passwordApp.trim()).digest('hex');
        settings.passwordApp = hashedInput;
    }

    fs.writeFile(filePath, JSON.stringify(settings, null, 2), (writeErr) => {
        if (writeErr) {
            console.error(writeErr);
            return res.status(500).send('Error saving data');
        }
        res.redirect('/?success=true');
    });

});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
