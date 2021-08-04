const Check = {
  isLineBreak: function(str){
    return str.length === 0;
  },
  isTitle: function(str){
    return str === "#";
  },
  isSubtitle: function(str){
    return str.indexOf("<b>") === -1;
  },
  isVideo: function(type){
    return type.num === -1;
  },
  isImg: function(type){
    return type.index !== 0;
  },
  checkType: function(str){
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
}

module.exports = { Check };
