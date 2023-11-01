import express from 'express';
import http, { get, request } from 'http';
import session from 'express-session';
const expressSocketIoSession = require('express-socket.io-session');
import ejs from 'ejs';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import * as fs from 'fs';

import User from './interfaces/User';
import UserData from './interfaces/UserData'
import Group from './interfaces/Group';

declare module 'express-session' {
    interface SessionData {
      user: { id: number; username: string };
    }
}

const app = express();
const httpServer = http.createServer(app);
const port = 3000;
const chatGroups: Group[] = JSON.parse(fs.readFileSync('./data/groups.json', 'utf-8'));
const usersFile: User[] = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
let userData: UserData[] = [];

if(usersFile) {
  for (const iterator of usersFile) {
    const userItem: UserData = {id: iterator.id, username: iterator.username};

    userData.push(userItem);
  }
}

const io = new Server(httpServer);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: 'verySecret',
    resave: false,
    saveUninitialized: true,
  })
);

// Use express-socket.io-session to handle sessions for socket.io
// io.use(
//   expressSocketIoSession(session, {
//     autoSave: true,
//     resave: false, // Add this line to configure resave
//     saveUninitialized: true, // Add this line to configure saveUninitialized
//     secret: 'verySecret', // Add this line to configure the secret
//   })
// );

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/home.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

app.get('/chatPage', (req, res) => {
  res.render('chatPage', { chatGroups, userData });
});

app.get('/chat', (req, res) => {
  res.render('chat', { chatGroups, userData });
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
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/chat');
    } else {
      res.send('Login failed. Please try again.');
    }
});

io.on('connection', (socket) => {
  // Handle chat functionality here
  socket.on('startChat', ({ userId }) => {
    const handshakeWithSession = socket.handshake as any; // Use 'any' type for type assertion
    const currentUserId = handshakeWithSession.session.user.id;
    // const currentUserId = socket.request.session.user.id;
  
    const roomName = `private-${currentUserId}-${userId}`;
    socket.join(roomName);
  
    socket.emit('chatStarted', { room: roomName });
    io.to(userId).emit('chatStarted', { room: roomName });
  });

  socket.on('sendMessage', ({ room, message }) => {
    io.to(room).emit('messageReceived', { message });
  });  
});

app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/views/notFound.html');
});

httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});