const express = require('express');
const app = express();

var PORT = process.env['NODE_PORT'] || 8890;

app.get('/', (request, response) => {
  response.send('Hello World from Express!');
});

app.listen(PORT, () => {
  console.log('Example app listening on port', PORT);
});
