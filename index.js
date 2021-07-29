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

async function getTags(url){
  let result = '';
  const driver = await new Builder()
  .forBrowser('chrome')
  .build();
  try{
    //url의 요소를 로드
    await driver.get(url);
    //네이버 블로그 포스트는 iframe속에 들어가 있으므로 첫번째 iframe으로 전환
    await driver.switchTo().frame(0);
    //className을 클래스로 가진 elements를 리스트에 저장
    const className = "__se-hash-tag";
    const resultElements = await driver.findElements(By.className(className));
    //#을 빼고 파싱하여 리스트를 업데이트 및 result에 알맞은 형식으로 추가
    for(let i = 0; i < resultElements.length; i++){
      const text = await resultElements[i].getText();
      resultElements[i] = text.substring(1, text.length);
      result = result + '<div>' + text + '</div>';
    }
  }finally{
    driver.quit();
  }
  return result;
}

//리퀘스트가 들어오면 init을 실행
app.get('/', function(req, res) {
  //url에서 태그들을 parsing한 결과물을 웹페이지에 출력
  const url = "https://blog.naver.com/a-eve/222437178579";
  getTags(url)
  .then(html => res.send(html));
});

//3000번 포트에 서버를 시작
var port = 3000;
app.listen(port, function(){
  console.log('Server Running - http://localhost:'+port);
});
