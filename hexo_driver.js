var restify = require('restify');
const PORT = process.env.NODE_PORT || 3000;

function echo(req, res, next) {
  res.send('hello');
  next();
}

var server = restify.createServer();
server.get('/', echo);
// server.head('/hello/:name', echo);

server.listen(PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
