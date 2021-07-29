var express = require('express');
var app = express();

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

app.get('/', function(req, res) {
  let result = '';
  const {Builder, By, Key, until} = require('selenium-webdriver');

  async function example() {
    let driver = await new Builder()
    .forBrowser('chrome')
    .build();
    try{
      await driver.get('https://blog.naver.com/a-eve/222437178579');
      await driver.switchTo().frame(0);
      let resultElements = await driver.findElements(By.className('__se-hash-tag'));
      console.log('[resultElements.length]', resultElements.length);
      for(let i = 0; i < resultElements.length; i++){
        let temp = await resultElements[i].getText();
        temp = temp.substring(1, temp.length);
        resultElements[i] = temp;
        result = result + '<div>' + temp + '</div>';
        console.log(temp);
      }
    }
    finally{
      driver.quit();
    }
  }

  async function init(){
    await example();
    res.send(result);
  }
  init();
  // await example();
  // res.send(result);
});

var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});
