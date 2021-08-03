let data = {};

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

async function getTags(driver, url){
  let result = '';
  try{
    //url의 요소를 로드
    await driver.get(url);
    //네이버 블로그 포스트는 iframe속에 들어가 있으므로 첫번째 iframe으로 전환
    await driver.switchTo().frame(0);
    //titleName을 클래스로 가진 elements를 titles에 저장
    const titleName = "__se-hash-tag";
    const titles = await driver.findElements(By.className(titleName));
    //textName을 클래스로 가진 elements를 texts에 저장
    const textName = "se-text-paragraph";
    const texts = await driver.findElements(By.className(textName));
    //titles를 업데이트
    const imgName = "se-image-resource";
    const imgs = await driver.findElements(By.className(imgName));
    for(let i = 0; i < titles.length; i++){
      //titles는 원래 앞에 #이 붙어있는데, 해당 문자를 substring으로 삭제하여 업데이트
      const title = await titles[i].getText();
      titles[i] = title.substring(1, title.length);
      //만약 data에 해당 title이 존재하지 않는다면 새로운 리스트를 생성
      if(data[titles[i]] === undefined){
        data[titles[i]] = [];
      }
    }
    //data를 업데이트
    //texts의 첫번째 요소는 무조건 글의 제목이므로 1부터 시작
    let cnt = -1;
    let cntImg = 0;
    for(let i = 1; i < texts.length; i++){
      const html = await texts[i].getAttribute("innerHTML");
      const text = await texts[i].getText();
      //줄바꿈이라면 건너뛰기
      if(text.length === 0){

      }
      //title이라면 건너뛰기
      else if(text[0] === '#'){
        cnt++;
      }
      //<b> 태그로 소제목을 구분하도록 설정하였으므로,
      //<b> 태그가 존재하지 않으면 전의 소제목에 속하는 것
      //따라서 <b> 태그가 없다면 전의 소제목 내용 + 현재 내용 후 건너뛰기
      else if(html.indexOf("<b>") === -1){
        let arr = data[titles[cnt]][data[titles[cnt]].length - 1];
        arr.text = arr.text + '<br>' + text;
      }
      //아무것도 해당되지 않는다면 data에 현재 내용을 push
      else{
        if(checkNum(text) !== -1){
          console.log(text);
          const img = await imgs[cntImg++].getAttribute("src");
          console.log(cntImg, img);
          data[titles[cnt]].push({text, img});
        } else {
          data[titles[cnt]].push({text, img: undefined});
        }
      }
    }
  } catch(e){
    console.log(e);
  }
}

function checkNum(str){
  if(str.search(/(^\d:)/) !== -1){
    return str.search(/(^\d:)/) + 2;
  } else if(str.search(/(^\d\.)/) !== -1){
    return str.search(/(^\d\.)/) + 2;
  } else if(str.search(/(^\d-\d)/) !== -1){
    return str.search(/(^\d-\d)/) + 4;
  } else if(str.search(/(^\d~\d)/) !== -1){
    return str.search(/(^\d~\d)/) + 4;
  } return -1;
}

//리퀘스트가 들어오면 init을 실행
app.get('/', function(req, res) {
  //url에서 태그들을 parsing한 결과물을 웹페이지에 출력
  const url = ["https://blog.naver.com/a-eve/222450141159", "https://blog.naver.com/a-eve/222437178579"];
  async function sendHtml(){
    let html = '';
    //selenium 빌더를 생성
    const driver = await new Builder()
    .forBrowser('chrome')
    .build();
    //모든 url을 돌면서 정보를 저장
    for(let i = 0; i < url.length; i++){
      const temp = await getTags(driver, url[i]);
    }
    //selenium 빌더를 삭제
    driver.quit();
    //웹사이트에 표시할 result를 생성
    for(let [title, arr] of Object.entries(data)){
      let cntImg = 0;
      html = html + '<div style="margin: 2rem">' + title;
      for(let i = 0; i < arr.length; i++){
        // if(numList.indexOf(arr[i].substring(0, 2)) !== -1){
        const isFrontNum = checkNum(arr[i].text.substring(0, arr[i].text.indexOf(":") + 1));
        if(isFrontNum !== -1){
          html = html + '<div style="margin: 1rem">' + `<img referrerpolicy="no-referrer" src="${arr[i].img}">` + arr[i].text.substring(isFrontNum, arr[i].text.length) + '</div>';
        }
        else {
          html = html + '<div style="margin: 1rem">' + arr[i].text + '</div>';
        }
      }
      html = html + '</div>';
    }
    // console.log("-----data-----");
    // console.log(data);
    // console.log("-----title-----");
    // console.log(titles);
    // console.log("-----text-----");
    // console.log(texts);
    res.send(html);
  }
  sendHtml();
});

//3000번 포트에 서버를 시작
var port = 3000;
app.listen(port, function(){
  console.log('Server Running - http://localhost:' + port);
});
