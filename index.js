const { Data } = require('./data.js');
const { Check } = require('./check.js');
const { Update } = require('./update.js');

//express 서버를 로드
const express = require('express');
const app = express();

//selenium과 chrome을 사용하기 위하여 관련 모듈 로드
const webdriver = require('selenium-webdriver');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

//chrome을 default로 설정
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

async function getUrlInfo(driver, url){
  let result = '';
  try{
    //url의 요소를 로드
    await driver.get(url);
    //네이버 블로그 포스트는 iframe속에 들어가 있으므로 첫번째 iframe으로 전환
    await driver.switchTo().frame(0);
    const titles = await driver.findElements(By.className("__se-hash-tag"));
    const texts = await driver.findElements(By.className("se-text-paragraph"));
    const imgs = await driver.findElements(By.className("se-image-resource"));
    const videos = await driver.findElements(By.className("se-oembed"));

    await Update.updateTitles(titles);
    await Update.updateData(titles, texts, imgs, videos);
  } catch(e){
    console.log(e);
  }
}

async function getUrlInfos(url){
  //selenium 빌더를 생성
  const driver = await new Builder()
  .forBrowser('chrome')
  .build();
  //모든 url을 돌면서 정보를 저장
  for(let i = 0; i < url.length; i++){
    const temp = await getUrlInfo(driver, url[i]);
  }
  //selenium 빌더를 삭제
  driver.quit();
}

function getFilteredText(str){
  return str.substring(0, str.indexOf(":") + 1);
}

function createHtml(){
  let html = '';
  for(let [title, arr] of Object.entries(Data)){
    html = html + '<div style="margin: 2rem">' + title;
    for(let i = 0; i < arr.length; i++){
      const text = arr[i].text;
      const type = Check.checkType(getFilteredText(text));
      if(Check.isVideo(type)){
        html = html + '<div style="margin: 1rem">' + `<iframe src="${arr[i].video}"></iframe>` + text.substring(type.index, text.length) + '</div>';
      } else if(Check.isImg(type)){
        html = html + '<div style="margin: 1rem">' + `<img referrerpolicy="no-referrer" src="${arr[i].img}">` + text.substring(type.index, text.length) + '</div>';
      } else {
        html = html + '<div style="margin: 1rem">' + text + '</div>';
      }
    }
    html = html + '</div>';
  }
  return html;
}

async function sendHtml(res){
  const url = ["https://blog.naver.com/a-eve/222450141159", "https://blog.naver.com/a-eve/222437178579"];
  await getUrlInfos(url);
  res.send(createHtml());
}

//리퀘스트가 들어오면 init을 실행
app.get('/', function(req, res) {
  //url에서 태그들을 parsing한 결과물을 웹페이지에 출력
  sendHtml(res);
});

//3000번 포트에 서버를 시작
var port = 3000;
app.listen(port, function(){
  console.log('Server Running - http://localhost:' + port);
});
