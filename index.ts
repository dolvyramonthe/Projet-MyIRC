import express from 'express';
import bodyParser from 'body-parser';
import * as fs from 'fs';

import loginPage from './wiews/loginGenerator';
import homePage from './wiews/homeGenerator';
import chatPage from './wiews/chatGenerator';
import User from './interfaces/User';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const homePageHtml: string = homePage();

app.get('/', (req, res) => {
    res.send(homePageHtml);
});

const loginPageHtml: string = loginPage();

app.get('/login', (req, res) => {
  res.send(loginPageHtml);
});

const chatPageHtml: string = chatPage();

app.get('/chat', (req, res) => {
    res.send(chatPageHtml);
});

app.post('/', (req, res) => {
    let loginButton = req.body.button;

    loginButton.addEventListener('click', () => {
        res.redirect('/login');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users: User[] = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
    let user: User = {id: 0, username: '', password: ''};

    if(users) {
        for (const item of users) {
           if(item.username === username) {
                user = item;
           }
        }
    }

  
    if (username === user.username && password === user.password) {
      res.redirect('/chat');
    } else {
      res.send('Login failed. Please try again.');
    }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});