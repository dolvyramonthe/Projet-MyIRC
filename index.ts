import express from 'express';
import http, { get, request } from 'http';
import session from 'express-session';
const expressSocketIoSession = require('express-socket.io-session');
import ejs from 'ejs';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import * as fs from 'fs';
import { RowDataPacket } from 'mysql2';

import User from './interfaces/User';
import UserData from './interfaces/UserData'
import Group from './interfaces/Group';
import MessageTab from './interfaces/MessageTab';
import { db } from './db';
import { getTableData, updateGroup, insertUserData, updatePassword } from './usersManagement';
import { group } from 'console';

declare module 'express-session' {
    interface SessionData {
      user: { id: number; username: string };
    }
}

const app = express();
const httpServer = http.createServer(app);
const port = 3000;
const groupStatement: string = 'select * from chat_groups';
let chatGroups: Group[] = [];

getTableData(groupStatement)
    .then(data => {
      chatGroups = data;
    })
    .catch(error => {
        console.error(error);
    });

const usersStatement: string = 'select * from users';
let usersFile: User[] = [];
let userData: UserData[] = [];
let usersData: UserData[] = [];

// const usersFile: User[] = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
let currentUserId: number = 0;
let messagesTab: MessageTab[] = [];
let messageTab: MessageTab = {sender: '', message: ''};
let messagesTabFille: string = '';

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

app.get('/updatePassword', (req, res) => {
  res.sendFile(__dirname + '/views/updatePassword.html');
});

app.get('/updateGroup', (req, res) => {
  res.sendFile(__dirname + '/views/updateGroup.html');
});

getTableData(usersStatement)
    .then(data => {
      usersFile = data;
      
      if(usersFile) {
        for (const iterator of usersFile) {
          const userItem: UserData = {id: iterator.id, username: iterator.username};
      
          userData.push(userItem);
        }
      }
      
    })
    .catch(error => {
        console.error(error);
    });
    
app.get('/chatPage', (req, res) => {
  if(req.session.user) {
    const connectedUserId: any = req.session.user.id;
    const connectedUserName: any = req.session.user.username;

    res.render('chatPage', { chatGroups, usersData, connectedUserId, connectedUserName });
  } else {
    res.redirect('/');
  }
});

app.get('/groupChatPage', (req, res) => {
  if(req.session.user) {
    const connectedUserId: any = req.session.user.id;
    const connectedUserName: any = req.session.user.username;

    res.render('groupChatPage', { chatGroups, usersData, connectedUserId, connectedUserName });
  } else {
    res.redirect('/');
  }
});

app.get('/chat', (req, res) => {
  if(req.session.user) {
    const connectedUser: any = req.session.user;

    res.render('chat', { chatGroups, usersData, connectedUser });
  } else {
    res.redirect('/');
  }
});

app.get('/admin', (req, res) => {
  if(req.session.user) {
    const connectedUser: any = req.session.user;

    res.render('admin', { chatGroups, usersData, connectedUser });
  } else {
    res.redirect('/');
  }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    let user: User = {id: 0, username: '', password: '', role_id: 0};

    if(usersFile) {
        for (const item of usersFile) {
           if(item.username === username) {
                user = item;
           }
        }
    }
  
    if (username === user.username && password === user.password) {
        req.session.user = { id: user.id, username: user.username };
        currentUserId = req.session.user.id;
        usersData = userData.filter((item) => item.id !== currentUserId);
        
        if(user.role_id === 3) {
          res.redirect('/chat');
        } else if(user.role_id === 4) {
          res.redirect('/admin');
        }
    } else {
      res.send('Login failed. Please try again.');
    }
});

app.post('/updatePassword', (req, res) => {
  const { hiddenInput, password, passwordconf } = req.body;

  if (password === passwordconf) {
    updatePassword(hiddenInput, password);
  } else {
    res.send('Passwords not conform.');
  }
});

app.post('/updateGroup', (req, res) => {
  let groupId: number = 0;
  const { oldgroup, newgroup } = req.body;

  for (const iterator of chatGroups) {
    if(iterator.desc === oldgroup) {
      groupId = iterator.id;
    }
  }

  if (oldgroup.length && newgroup.length > 3) {
    updateGroup(groupId, newgroup);
  } else {
    res.send('Passwords not conform.');
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
    messagesTabFille = roomName;

    if(fs.existsSync('./logs/' + messagesTabFille + '.log')) {
      messagesTab = JSON.parse(fs.readFileSync('./logs/' + messagesTabFille + '.log', 'utf-8'));
    } else {
      messagesTab = [];
    }

    socket.emit('chatStarted', { room: roomName, oldMessages: messagesTab });
    console.log(messagesTab);
    io.to(userId).emit('chatStarted', { room: roomName });
  });

  socket.on('sendMessage', ({ room, message, sender, senderN }) => {
    messagesTabFille = room;
    messageTab.sender = senderN;
    messageTab.message = message;
    messagesTab.push(messageTab);

    if(messagesTabFille.length > 0) {
    
      const data: string = JSON.stringify(messagesTab);
    
      try {
        fs.writeFileSync('./logs/' + messagesTabFille + '.log', data, 'utf-8');
      } catch (error) {
        console.log(error);
      }
    }

    io.to(room).emit('messageReceived', { message, sender, senderN });
  });  
});


io.on('connection', (socket) => {
  socket.on('startChatGroup', ({ groupId }) => {
    let roomName: string = '';
    let currentUser: string = '';
    let user: string = '';

    for (const item of chatGroups) {
      if(item.id === parseInt(groupId, 10)) {
        roomName = item.desc;
      }
    }

    for (const item of userData) {
      if(item.id === currentUserId) {
        currentUser = item.username;
      }
    }
  
    socket.join(roomName);
    messagesTabFille = roomName;

    if(fs.existsSync('./logs/' + messagesTabFille + '.log')) {
      messagesTab = JSON.parse(fs.readFileSync('./logs/' + messagesTabFille + '.log', 'utf-8'));
    } else {
      messagesTab = [];
    }

    socket.emit('chatGroupStarted', { room: roomName, oldMessages: messagesTab });
    io.to(groupId).emit('chatGroupStarted', { room: roomName });
  });

  socket.on('sendGroupMessage', ({ room, message, sender, senderN }) => {
    messagesTabFille = room;
    messageTab.sender = senderN;
    messageTab.message = message;
    messagesTab.push(messageTab);

    if(messagesTabFille.length > 0) {
    
      const data: string = JSON.stringify(messagesTab);
    
      try {
        fs.writeFileSync('./logs/' + messagesTabFille + '.log', data, 'utf-8');
      } catch (error) {
        console.log(error);
      }
    }

    io.to(room).emit('messageGroupReceived', { message, sender, senderN });
  });  
});

app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + '/views/notFound.html');
});

httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});