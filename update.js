const { Data } = require('./data.js');
const { Check } = require('./check.js');
const { By } = require('selenium-webdriver');

const Update = {
  updateSubtitle: function(elem, text){
    elem.text = elem.text + '<br>' + text;
  },
  updateTitles: async function(titles){
    for(let i = 0; i < titles.length; i++){
      //titles는 원래 앞에 #이 붙어있는데, 해당 문자를 substring으로 삭제하여 업데이트
      const title = await titles[i].getText();
      titles[i] = title.substring(1, title.length);
      if(Data[titles[i]] === undefined){
        Data[titles[i]] = [];
      }
    }
  },
  updateData: async function(titles, texts, imgs, videos){
    let cntData = -1;
    let cntImg = 0;
    let cntVideo = 0;
    for(let i = 1; i < texts.length; i++){
      const html = await texts[i].getAttribute("innerHTML");
      const text = await texts[i].getText();
      const arr = Data[titles[cntData]];
      if(Check.isLineBreak(text)){

      } else if(Check.isTitle(text[0])){
        cntData++;
      } else if(Check.isSubtitle(html)){
        this.updateSubtitle(arr[arr.length - 1], text);
      } else{
        const textType = Check.checkType(text);
        if(Check.isVideo(textType)){
          const htmlVideo = await videos[cntVideo].findElements(By.tagName("script"));
          const url = await htmlVideo[0].getAttribute("data-module");
          const video = url.match(/(?:src=\\")(.*?)(?:" )/)[1];
          arr.push({text, video});
          cntVideo = cntVideo + 1;
        } else if(Check.isImg(textType)){
          const img = await imgs[cntImg].getAttribute("src");
          arr.push({text, img});
          cntImg = cntImg + Check.checkType(text).num;
        } else {
          arr.push({text});
        }
      }
    }
  }
}

module.exports = { Update };
