const { Load } = require('./load.js');
const { Data } = require('./data.js');
const { Check } = require('./check.js');

const Display = {
  createHtml: function(){
    let html = '';
    for(let [title, arr] of Object.entries(Data)){
      html = html + '<div style="margin: 2rem">' + title;
      for(let i = 0; i < arr.length; i++){
        const text = arr[i].text;
        const type = Check.checkType(Load.loadFilteredText(text));
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
  },
  displayHtml: async function(url){
    await Load.loadUrlInfos(url);
    return this.createHtml();
  }
}

module.exports = { Display };
