const { Builder, By } = require('selenium-webdriver');
const { Update } = require('./update.js');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

const Load = {
  loadUrlInfo: async function(driver, url){
    let result = '';
    try{
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
  },
  loadUrlInfos: async function(url){
    const driver = await new Builder()
    .forBrowser('chrome')
    .build();
    for(let i = 0; i < url.length; i++){
      const temp = await this.loadUrlInfo(driver, url[i]);
    }
    driver.quit();
  },
  loadFilteredText: function(str){
    return str.substring(0, str.indexOf(":") + 1);
  }
}

module.exports = { Load };
