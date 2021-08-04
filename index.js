const { Check } = require('./check.js');

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

function updateSubtitle(elem, text){
  elem.text = elem.text + '<br>' + text;
}

async function updateTitles(titles){
  for(let i = 0; i < titles.length; i++){
    //titles는 원래 앞에 #이 붙어있는데, 해당 문자를 substring으로 삭제하여 업데이트
    const title = await titles[i].getText();
    titles[i] = title.substring(1, title.length);
    //만약 data에 해당 title이 존재하지 않는다면 새로운 리스트를 생성
    if(data[titles[i]] === undefined){
      data[titles[i]] = [];
    }
  }
}

async function updateData(titles, texts, imgs, videos){
  //data를 업데이트
  let cntData = -1;
  let cntImg = 0;
  let cntVideo = 0;
  //texts의 첫번째 요소는 무조건 글의 제목이므로 1부터 시작
  for(let i = 1; i < texts.length; i++){
    const html = await texts[i].getAttribute("innerHTML");
    const text = await texts[i].getText();
    const arr = data[titles[cntData]];
    if(Check.isLineBreak(text)){

    } else if(Check.isTitle(text[0])){
      cntData++;
    } else if(Check.isSubtitle(html)){
      updateSubtitle(arr[arr.length - 1], text);
    } else{
      const textType = checkNum(text);
      if(Check.isVideo(textType)){
        const htmlVideo = await videos[cntVideo].findElements(By.tagName("script"));
        const url = await htmlVideo[0].getAttribute("data-module");
        const video = url.match(/(?:src=\\")(.*?)(?:" )/)[1];
        arr.push({text, video});
        cntVideo = cntVideo + 1;
      } else if(Check.isImg(textType)){
        const img = await imgs[cntImg].getAttribute("src");
        arr.push({text, img});
        cntImg = cntImg + checkNum(text).num;
      } else {
        arr.push({text});
      }
    }
  }
}

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

    await updateTitles(titles);
    await updateData(titles, texts, imgs, videos);
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

//checkModNum()
//input: 요소의 내용
//return: [번호를 제외한 내용의 인덱스 (index), 사진/비디오의 갯수 (num)]
//index: 번호를 제외한 순수한 내용의 첫번째 인덱스 (e.g. "1.정돈: 정사각형같은 맛이다" => 2)
//num: 사진일경우 사진의 갯수, 비디오일경우 -1, 글만 존재할경우 0
function checkNum(str){
  let index;
  //한개의 사진일 경우 (숫자 + : 또는 숫자 + .)
  if(index = str.search(/(^\d[:.])/) !== -1){
    return {index: index + 2, num: 1};
  }
  //여러개의 사진일 경우 (숫자~숫자 또는 숫자-숫자)
  else if(index = str.search(/(^\d[-~]\d)/) !== -1){
    return {index: index + 4, num: str[2]/1 - str[0]/1 + 1};
  }
  //비디오일 경우 (숫자 + v)
  else if(index = str.search(/(^\dv)/) !== -1){
    return {index: index + 3, num: -1};
  }
  //글만 존재할 경우
  return {index: 0, num: 0};
}

function getFilteredText(str){
  return str.substring(0, str.indexOf(":") + 1);
}

function createHtml(){
  let html = '';
  for(let [title, arr] of Object.entries(data)){
    html = html + '<div style="margin: 2rem">' + title;
    for(let i = 0; i < arr.length; i++){
      const text = arr[i].text;
      const type = checkNum(getFilteredText(text));
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
