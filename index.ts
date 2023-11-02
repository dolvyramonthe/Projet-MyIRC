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
import MessageTab from './interfaces/MessageTab';

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
let usersData: UserData[] = [];
let currentUserId: number = 0;
let messagesTab: MessageTab[] = [];
let messageTab: MessageTab = {sender: '', message: ''};
let messagesTabFille: string = '';

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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/home.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

app.get('/chatPage', (req, res) => {
  if(req.session.user) {
    const connectedUserId: any = req.session.user.id;
    const connectedUserName: any = req.session.user.username;

    res.render('chatPage', { chatGroups, usersData, connectedUserId, connectedUserName });
  }
});

app.get('/chat', (req, res) => {
  if(req.session.user) {
    const connectedUser: any = req.session.user;

    res.render('chat', { chatGroups, usersData, connectedUser });
  }
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
        currentUserId = req.session.user.id;
        usersData = userData.filter((item) => item.id !== currentUserId);
        res.redirect('/chat');
    } else {
      res.send('Login failed. Please try again.');
    }
});

io.on('connection', (socket) => {
  socket.on('startChat', ({ userId }) => {
    let roomName: string = '';
    let currentUser: string = '';
    let user: string = '';

    for (const item of userData) {
      if(item.id === currentUserId) {
        currentUser = item.username;
      }
    }

    for (const item of userData) {
      if(item.id === parseInt(userId,10)) {
        user = item.username;
      }
    }
    
    if(currentUserId < userId) {
      roomName = `private-group-${currentUser}-${user}`;
    } else {
      roomName = `private-group-${user}-${currentUser}`;
    }
  
    socket.join(roomName);

    socket.emit('chatStarted', { room: roomName });
    io.to(userId).emit('chatStarted', { room: roomName });
  });

  socket.on('sendMessage', ({ room, message, sender, senderN }) => {
    messagesTabFille = room;
    messageTab.sender = senderN;
    messageTab.message = message;
    messagesTab.push(messageTab);

    io.to(room).emit('messageReceived', { message, sender, senderN });
  });  
});

console.log(messagesTabFille, messagesTab);

if(messagesTabFille.length > 0) {
  // try {
  //   messagesTab = JSON.parse(fs.readFileSync('./logs/' + messagesTabFille + '.log', 'utf-8')) || [];
  // } catch (error) {
  //   console.error(error);
  // }

  const data: string = JSON.stringify(messagesTab);

  try {
    fs.writeFileSync('./logs/' + messagesTabFille + '.log', data, 'utf-8');
  } catch (error) {
    console.error(error);
  }
}

app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/views/notFound.html');
});

httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});