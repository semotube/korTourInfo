const def = require("./def.js")

let contentArray = [
  { code: "", name: "관광타입 전체" },
  { code: "12", name: "관광지" },
  { code: "14", name: "문화시설" },
  { code: "15", name: "행사/공연/축제" },
  { code: "25", name: "여행코스" },
  { code: "28", name: "레포츠" },
  { code: "32", name: "숙박" },
  { code: "38", name: "쇼핑" },
  { code: "39", name: "음식점" }
];
let arrangeArray= [
  {code : "A", name: "제목순"},
  {code : "B", name: "인기순"},
  {code : "C", name: "최근수정순"},
  {code : "D", name: "등록순"},
  {code : "O", name: "제목순(이미지)"},
  {code : "P", name: "인기순(이미지)"},
  {code : "Q", name: "최근수정순(이미지)"},
  {code : "R", name: "등록순(이미지)"},
];
let stayArray= [
  {code : "", name: "전체"},
  {code : "1", name: "굿스테이"},//순서확인
  {code : "1", name: "한옥"},
  {code : "1", name: "베니키아"},
];
// init
////////////////////////////////////////////////////////////////////////////////////
function init() {
  let categoryArray = initCategoryArray(0);//contentId = 0으로 초기값 설정.
  let areaArray = initAreaArray();
  return [contentArray, categoryArray, areaArray, arrangeArray];
}

function init4Festival() {
  let categoryArray = initCategoryArray(3);//Festival contentId = 3 : 행사검색이므로 3으로 고정.
  let areaArray = initAreaArray();
  return [categoryArray, areaArray, arrangeArray];
}

function init4Stay() {
  let areaArray = initAreaArray();
  return [areaArray, stayArray, arrangeArray];
}

function initCategoryArray( contentIndex ) {
  let getArray= wx.getStorageSync(def.CategoryCode);
  let resArray= [[],[],[]];
  if( getArray  ) {
    getArray[contentIndex].cat1.forEach((item, key) => {
      resArray[0].push({ code: item.code, name: item.name } );
    })
    getArray[contentIndex].cat1[0].cat2.forEach((item, key) => {
      resArray[1].push({ code: item.code, name: item.name });
    })
    getArray[contentIndex].cat1[0].cat2[0].cat3.forEach((item, key) => {
      resArray[2].push({ code: item.code, name: item.name });
    })
  }
  return resArray;
}

function initAreaArray() {
  let getArray= wx.getStorageSync(def.AreaCode);
  let resArray= [[],[]];
  if( getArray  ) {
    getArray.forEach((item, key) => {
      resArray[0].push({ code: item.code, name: item.name });
    })
    getArray[0].sigunguCodeArray.forEach((item, key) => {
      resArray[1].push({ code: item.code, name: item.name });
    })
  }
  return resArray;
}

// ColumnChange Picker
////////////////////////////////////////////////////////////////////////////////////
function categoryColumnChange(contentIndex, categoryIndex, categoryArray, e) {
  categoryIndex[e.detail.column] = e.detail.value;
  switch (e.detail.column) {
    case 0:
      categoryArray[1] = [];
      wx.getStorageSync(def.CategoryCode)[contentIndex].cat1[categoryIndex[0]].cat2.forEach((item, key) => {
        categoryArray[1].push({ code: item.code, name: item.name });
      })
      categoryArray[2] = [];
      wx.getStorageSync(def.CategoryCode)[contentIndex].cat1[categoryIndex[0]].cat2[0].cat3.forEach((item, key) => {
        categoryArray[2].push({ code: item.code, name: item.name });
      })
      categoryIndex[1] = 0;
      categoryIndex[2] = 0;
      break;
    case 1: 
      categoryArray[2] = [];
      wx.getStorageSync(def.CategoryCode)[contentIndex].cat1[categoryIndex[0]].cat2[categoryIndex[1]].cat3.forEach((item, key) => {
        categoryArray[2].push({ code: item.code, name: item.name });
      })
      categoryIndex[2] = 0;
      break;
  }
  return [categoryIndex, categoryArray];
}

function areaColumnChange(areaIndex, areaArray, e) {
  areaIndex[e.detail.column] = e.detail.value;
  switch (e.detail.column) {
    case 0:
      areaArray[1] = [];
      wx.getStorageSync(def.AreaCode)[e.detail.value].sigunguCodeArray.forEach((item, key) => {
        areaArray[1].push({ code: item.code, name: item.name });
      })
      areaIndex[1] = 0;
      break;
  }
  return [areaIndex, areaArray];
}


module.exports = {
  init,
  init4Festival,
  init4Stay,
  initCategoryArray,
  categoryColumnChange,
  areaColumnChange,
}