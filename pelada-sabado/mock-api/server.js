const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./mock-api/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// CORS para Angular dev server
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

server.use('/api', router);
server.listen(3000, () => {
  console.log('🚀 Mock API rodando em http://localhost:3000/api');
  console.log('   Jogadores: http://localhost:3000/api/jogadores');
  console.log('   Peladas:   http://localhost:3000/api/peladas');
});
