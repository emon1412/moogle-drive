import server from './src/entryPoints/server.js';

server.listen(process.env.port || 8085, function () {
  console.log('Moogle Drive is listening on port 8085.');
});