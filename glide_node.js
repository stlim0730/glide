const express = require('express');
const app = express();
var Hexo = require('hexo'); // Maybe var?
var PROJECT_PATH = '/glide/hexotest';
var hexo = new Hexo(PROJECT_PATH, {});
// hexo.init();

var PORT = process.env['NODE_PORT'] || 8890;

app.get('/', (request, response) => {
  response.send('Hello World from Express!');
});

// app.get('/view', (request, response) => {
//   var results = '###';
//   var view = hexo.theme.getView('hexotest/themes/landscape/layout/_partial/post/date.ejs');
//   if (view)
//     response.send(view);
//   else
//     response.send(results);
// });

app.listen(PORT, () => {
  console.log('Example app listening on port', PORT);
});

// http://www.giraffeacademy.com/static-site-generators/hexo/creating-a-new-hexo-site/
