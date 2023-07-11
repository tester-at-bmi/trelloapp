const jsonServer = require('json-server');
const auth = require('json-server-auth');
const nocache = require('nocache');

const server = jsonServer.create();

const defaults = jsonServer.defaults({ static: '.' });
const busboy = require('connect-busboy');
const history = require('connect-history-api-fallback');
const middleware = require('./middleware.js');

const router = jsonServer.router('./public/data/data.json');

server.db = router.db;
server.use(history());
server.use(defaults);
server.use(nocache());
server.use(busboy());
server.use(jsonServer.rewriter({
  '/api/*': '/$1',
  '/users/*': '/600/users/$1',
}));
server.use(auth);
server.use(jsonServer.bodyParser);
server.use(middleware);

server.use(router);
const app = server.listen(3000, () => {
  process.exit(1);
});

const io = require('socket.io')(app);

io.on('connection', (socket) => {
  socket.on('boardCreated', (message) => {
    io.emit('boardCreated', message);
  });
  socket.on('boardsState', (message) => {
    io.emit('boardsState', message);
  });
  socket.on('boardDeleted', (id) => {
    io.emit('boardDeleted', id);
  });
  socket.on('boardUpdate', (id, message) => {
    io.emit('boardUpdate', id, message);
  });
  socket.on('listCreated', (boardId, message) => {
    io.emit('listCreated', boardId, message);
  });
  socket.on('listUpdated', (id, message) => {
    io.emit('listUpdated', id, message);
  });
  socket.on('listDeleted', (id) => {
    io.emit('listDeleted', id);
  });
  socket.on('taskCreated', (listId, message) => {
    io.emit('taskCreated', listId, message);
  });
  socket.on('taskUpdated', (id, message) => {
    io.emit('taskUpdated', id, message);
  });
  socket.on('taskDeleted', (id, message) => {
    io.emit('taskDeleted', id, message);
  });

});