// const express = require('express');
// const app = express();

// var PORT = process.env['NODE_PORT'] || 8890;

// app.get('/', (request, response) => {
//   response.send('Hello World from Express!');
// });

// app.listen(PORT, () => {
//   console.log('Example app listening on port', PORT);
// });

// http://www.giraffeacademy.com/static-site-generators/hexo/creating-a-new-hexo-site/

var PROJECT_PATH = process.cwd() + '/hexo';

var Hexo = require('hexo');
var hexo = new Hexo(PROJECT_PATH, {});

hexo.init().then(function(){
  console.log(hexo);
});
