// pages/user/code/code.js
const api = require("../../../utils/api.js");
const util = require("../../../utils/util.js");
const def = require("../../../utils/def.js");
const code = require("../../../utils/code.js");

Page({

  data: {
    contentIndex: 0,
    categoryIndex: [0, 0, 0],
    areaIndex: [0, 0],
    arrangeIndex: 0,
    contentArray: [],//콘텐츠타입(ContentTypeId) 코드표
    categoryArray: [[],[],[]],//분류코드
    areaArray: [[],[]],//지역코드,시군구코드
    arrangeArray: [],//정렬코드
  },

  onLoad: function (options) {
    let res = code.init();
    this.setData({
      contentArray: res[0],
      categoryArray: res[1],
      areaArray: res[2],
      arrangeArray: res[3]
    })
  },

// 분류코드 업데이트
//////////////////////////////////////////////////////////////////////////////
categoryUpdate() {
  try {
    wx.removeStorageSync(def.CategoryCode);
  } catch (e) {
    // Do something when catch error
  }
  this.data.cnt = 0;
  this.data.tot = 0;
  this.data.categoryArray = [];
  this.data.contentArray.forEach((item, key) => {
    this.reqCat1(key, item.code);
  });
},
//서비스분류  - 대분류
reqCat1(contentKey, contentTypeId) {
  let that = this;
  api.request(api.CategoryCode, {
    contentTypeId: contentTypeId,
    numOfRows: 100,
  }).then(function (res) {
    if (res.response.header.resultMsg === "OK") {
      let item = res.response.body.items.item;
      if (!Array.isArray(item)) item = [item];
      item.unshift({ code: "", name: "대분류 전체", rnum: 0 });//배열의처음에추가
      that.data.contentArray[contentKey].cat1 = item;
      that.data.tot += item.length;
      item.forEach((item, key) => {
        that.reqCat2(contentKey, contentTypeId, key, item.code);
      });
    } else { 
      util.showToast("error reqCat1","error");
      console.error("reqCat1 : ", res.response.header.resultMsg) 
    }
  })
  .catch(function (res) { 
    util.showToast("error reqCat1","error");
    console.error("reqCat1 catch : ", res) }
  )
},
//서비스분류 - 중분류
reqCat2(contentKey, contentTypeId, cat1Key, cat1) {
  let that = this;
  api.request(api.CategoryCode, {
    contentTypeId: contentTypeId,
    cat1: cat1,
    numOfRows: 100,
  }).then(function (res) {
    if (res.response.header.resultMsg === "OK") {
      let item = res.response.body.items.item;
      if (!Array.isArray(item)) item = [item];
      item.unshift({ code: "", name: "중분류 전체", rnum: 0 });//배열의처음에추가
      //item 재정의
      if(cat1 == "") {
        item = [{ code: "", name: '중분류 전체', rnum: 0, cat3: [{ code: "", name: '소분류 전체', rnum: 0 }] }]; }
      that.data.contentArray[contentKey].cat1[cat1Key].cat2 = item;
      that.data.cnt++;
      that.data.tot += item.length;
      item.forEach((item, key) => {
        that.reqCat3(contentKey, contentTypeId, cat1Key, cat1, key, item.code);
      });
    } else { 
      util.showToast("error reqCat2","error");
      console.error("reqCat2 : ", res.response.header.resultMsg) 
    }
  })
  .catch(function (res) { 
    util.showToast("error reqCat2","error");
    console.error("reqCat2 catch : ", res) }
  )
},
//서비스분류 - 소분류
reqCat3(contentKey, contentTypeId, cat1Key, cat1, cat2Key, cat2) {
  let that = this;
  api.request(api.CategoryCode, {
    contentTypeId: contentTypeId,
    cat1: cat1,
    cat2: cat2,
    numOfRows: 100,
  }).then(function (res) {
    if (res.response.header.resultMsg === "OK") {
      let item = res.response.body.items.item;
      if (!Array.isArray(item)) item = [item];
      item.unshift({ code: "", name: "소분류 전체", rnum: 0 });//배열의처음에추가
      //item 재정의
      if(cat2 == "") {
        item = [{ code: "", name: '소분류 전체', rnum: 0 }]; }
      that.data.contentArray[contentKey].cat1[cat1Key].cat2[cat2Key].cat3 = item;
      that.data.cnt++;
      // console.log("[" + that.data.cnt + " / " + that.data.tot + "] => "+contentTypeId + " : " + cat1 + " : " + cat2 + " : cat3 : ", item);
      if(that.data.tot === that.data.cnt) {
        console.log("end ==========> tot : " + that.data.tot + " cnt : " + that.data.cnt);
        try {
          wx.setStorageSync(def.CategoryCode, that.data.contentArray);
        } catch (e) {
          // Do something when catch error
        }
        util.hideLoading();
        wx.showModal({
          title: '분류코드 업데이트 완료',
          confirmColor: '#b4282d',
          content: '업데이트 중 에러발생시 다시 업데이트 해주십시요.',
          showCancel: false,
          confirmText: "확인",
          complete: function () {
            that.setData({
              categoryArray: code.init()[1],
            })
          }
        })
      } 
    } else { 
      util.showToast("error reqCat3","error");
      console.error("reqCat3 : ", res.response.header.resultMsg)
    }
  })
  .catch(function (res) {
    util.showToast("error reqCat3","error");
    console.error("reqCat3 catch : ", res)
  })
},
// 지역코드 업데이트
//////////////////////////////////////////////////////////////////////////////
areaUpdate() {
  try {
    wx.removeStorageSync(def.AreaCode);
  } catch (e) {
    // Do something when catch error
  }
  this.data.cnt = 0;
  this.data.tot = 0;
  this.data.areaArray = [];
  this.reqAreaCode();
},
//지역코드
reqAreaCode() {
  let that = this;
  api.request(api.AreaCode, {
    numOfRows: 100,
  }).then(function (res) {
    if (res.response.header.resultMsg === "OK") {
      let item = res.response.body.items.item;
      if (!Array.isArray(item)) item = [item];
      item.unshift({ code: "", name: '지역 전체', rnum: 0, sigunguCodeArray: [{ code: "", name: '시군구 전체', rnum: 0 }] });//배열의처음에추가
      that.data.areaArray = item;
      that.data.tot += item.length;
      item.forEach((item, key) => {
        that.reqSigunguCode(key, item.code);
      });
    } else { 
      util.showToast("error getAreaCode","error");
      console.error("getAreaCode : ", res.response.header.resultMsg) 
    }
  })
  .catch(function (err) { 
    util.showToast("error getAreaCode","error");
    console.error("getAreaCode catch : ", err) }
  )
},
//시군구코드
reqSigunguCode(key, areaCode) {
  let that = this;
  api.request(api.AreaCode, {
    areaCode: areaCode,
    numOfRows: 100,
  }).then(function (res) {
    if (res.response.header.resultMsg === "OK") {
      let item = res.response.body.items.item;
      if (!Array.isArray(item)) item = [item];
      item.unshift({ code: "", name: '시군구 전체', rnum: 0 });//배열의처음에추가
      //item 재정의
      if(areaCode == "") {
        item = [{ code: "", name: '시군구 전체', rnum: 0 }]; }
      that.data.areaArray[key].sigunguCodeArray = item;
      that.data.cnt++;
      if(that.data.tot === that.data.cnt) {
        console.log("end ==========> tot : " + that.data.tot + " cnt : " + that.data.cnt);
        try {
          wx.setStorageSync(def.AreaCode, that.data.areaArray);
        } catch (e) {
          // Do something when catch error
        }
        util.hideLoading();
        wx.showModal({
          title: '지역코드 업데이트 완료',
          confirmColor: '#b4282d',
          content: '업데이트 중 에러발생시 다시 업데이트 해주십시요.',
          showCancel: false,
          confirmText: "확인",
          complete: function () {
            that.setData({
              areaArray: code.init()[2],
            })
          }
        })
      }        
    } else { 
      util.showToast("error reqSigunguCode","error");
      console.error("reqSigunguCode : ", res.response.header.resultMsg) 
    }
  })
  .catch(function (err) {
    util.showToast("error reqSigunguCode","error");
    console.error("reqSigunguCode catch : ", err)
  })
},


// picker Change 처리
////////////////////////////////////////////////////////////////////////////////
  contentChange(e) {
    let contentId = e.detail.value;
    this.setData({
      contentIndex: contentId,
      categoryIndex: [0, 0, 0],
      categoryArray: code.initCategoryArray(contentId),//contentId변경으로 인한 재설정.
    })
  },
  categoryColumnChange(e) {
    let contentIndex = this.data.contentIndex;
    let categoryIndex = this.data.categoryIndex;
    let categoryArray = this.data.categoryArray;
    let res = code.categoryColumnChange(contentIndex, categoryIndex, categoryArray, e);
    this.setData({
      categoryIndex: res[0],
      categoryArray: res[1],
    })
  },
  areaColumnChange(e) {
    let areaIndex = this.data.areaIndex;
    let areaArray = this.data.areaArray;
    let res = code.areaColumnChange(areaIndex, areaArray, e);
    this.setData({
      areaIndex: res[0],
      areaArray: res[1],
    })
  },  
  arrangeChange(e) {
    let contentId = e.currentTarget.dataset.id;
    this.setData({
      arrangeIndex: contentId,
    })
  },

})