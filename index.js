const { Data } = require('./data.js');
const { Load } = require('./load.js');
const { Check } = require('./check.js');
const { Update } = require('./update.js');
const { Display } = require('./display.js');

const express = require('express');
const app = express();

app.get('/', function(req, res) {
  const url = ["https://blog.naver.com/a-eve/222450141159", "https://blog.naver.com/a-eve/222437178579"];
  Display.displayHtml(url, res);
});

var port = 3000;
app.listen(port, function(){
  console.log('Server Running - http://localhost:' + port);
});
