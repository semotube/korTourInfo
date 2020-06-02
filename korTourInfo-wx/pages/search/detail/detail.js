// pages/search/detail/detail.js
const api = require("../../../utils/api.js");
const util = require("../../../utils/util.js");
const def = require("../../../utils/def.js");
const WxParse = require("../../../wxParse/wxParse.js");
const app = getApp()

class Tab {
  constructor(name) {
    this.name = name;
    this.reqState = "start";//"start","finish"
    this.resArray = [];
  }
}

Page({

  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    TabCur: 0,
    isFavor: false,

    tabArray: [
      new Tab("공통정보"),
      new Tab("소개정보"),
      new Tab("추가이미지")
    ],
  },

  onLoad: function (options) {
    console.log("options : ", options);

    this.setData({
      contentid: options.contentid,
    })

    this.detailCommon(options.contentid, options.contenttypeid);
    this.detailIntro(options.contentid, options.contenttypeid);
    this.detailImage(options.contentid, options.contenttypeid);
  },

  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
    })
  },


//공통정보  
   detailCommon(contentId, contentTypeId) {
    let that = this;
    that.data.tabArray[0].reqState = "start";
    api.request(api.DetailCommon, {
      contentId: contentId,//콘텐츠ID
      // contentTypeId: contentTypeId,//관광타입(관광지, 숙박 등) ID
      defaultYN: "Y",//defaultYN,//기본정보 조회여부 Y
      firstImageYN: "Y",//firstImageYN, //원본, 썸네일 대표이미지 조회여부 Y
      // areacodeYN: "Y",//areacodeYN,//지역코드, 시군구코드 조회여부
      // catcodeYN: "Y",//catcodeYN,//대,중,소분류코드 조회여부
      addrinfoYN: "Y",//addrinfoYN,//주소, 상세주소 조회여부
      // mapinfoYN: "Y",//mapinfoYN,//좌표X, Y 조회여부
      overviewYN: "Y",//overviewYN,//콘텐츠 개요 조회여부
    }).then(function (res) {
      if (res.response.header.resultMsg === "OK") {
        let item = res.response.body.items.item;
        if (!Array.isArray(item)) item = [item];

        console.log("item DetailCommon: =>>>>>", item[0])
        WxParse.wxParse('homepage', 'html', item[0].homepage?item[0].homepage:"", that);
        WxParse.wxParse('overview', 'html', item[0].overview?item[0].overview:"콘텐츠 개요가 없습니다.", that);
        // item[0].isFavor = that.findFavor(item[0].contentid);

        that.setData({
          isFavor: that.getIsFavor(),
          [`tabArray[0].resArray`]: item,
        })
        that.reqFinished(0);
        // util.hideLoading();
      } else { console.error("resultMsg != 'OK' : ", res.response.header.resultMsg) }
    })
    .catch(function (res) {
      util.hideLoading();
      console.error("catch : ", res)
    })
  },

//소개정보
  detailIntro(contentId, contentTypeId) {
    let that = this;
    that.data.tabArray[1].reqState = "start";
    api.request(api.DetailIntro, {
      contentId: contentId,//콘텐츠ID
      contentTypeId: contentTypeId,//관광타입(관광지, 숙박 등) ID
    }).then(function (res) {
      if (res.response.header.resultMsg === "OK") {
        let item = res.response.body.items.item;
        if (!Array.isArray(item)) item = [item];

        console.log("item DetailIntro: =>>>>>", item[0])

  //모든 항목을 html로 무조건 바꾼다. 구분가능하면 구분해서 해도 무방
        for (var propertyName in item[0]) {
          if( propertyName === "contentid" || propertyName === "contenttypeid" ) continue;
          WxParse.wxParse('tempWxParse', 'html', String(item[0][propertyName]), that);
          item[0][propertyName] = that.data.tempWxParse;
        }

        that.setData({
          [`tabArray[1].resArray`]: item,
        })
        that.reqFinished(1);
        // util.hideLoading();
      } else { console.error("resultMsg != 'OK' : ", res.response.header.resultMsg) }
    })
    .catch(function (res) {
      util.hideLoading();
      console.error("catch : ", res)
    })
  },
  
//이미지정보
  detailImage(contentId, contentTypeId, imageYN="Y") {
    let that = this;
    that.data.tabArray[2].reqState = "start";
    api.request(api.DetailImage, {
      contentId: contentId,//콘텐츠ID
      imageYN: imageYN,//Y=콘텐츠 이미지 조회, N=”음식점”타입의 음식지 이미지
      subImageYN: "Y",//Y=원본,썸네일 이미지, 조회 N=Null
    }).then(function (res) {
      if (res.response.header.resultMsg === "OK") {
        let item = res.response.body.items.item;
        if (!Array.isArray(item)) item = [item];
        
        console.log("item detailImage: [imageYN : "+imageYN+"] =>>>>>", item)
        if( item[0] != undefined) {
          that.setData({
            [`tabArray[2].resArray`]: imageYN == "Y" ? item : that.data.tabArray[2].resArray.concat(item),
          })
        }
        if( contentTypeId == "39" && imageYN == "Y") {
          that.detailImage(contentId, contentTypeId, "N");//음식점일때 컨텐츠이미지 받은다음 음식이미지를 더 요구하자.
        } else {
          that.reqFinished(2);
        }
      } else { console.error("resultMsg != 'OK' : ", res.response.header.resultMsg) }
    })
    .catch(function (res) {
      util.hideLoading();
      console.error("catch : ", res)
    })
  },
  

  reqFinished(tabCur) {
    let tab = this.data.tabArray;
    tab[tabCur].reqState = "finished";

    if( tab[0].reqState == "finished" && tab[1].reqState == "finished" && tab[2].reqState == "finished" ) {
      console.log("all finished ============= : ")
      util.hideLoading();
    }
  },

//즐겨찾기 처리
/////////////////////////////////////////////////////////////////////////////////////////////////////////
  bindFavor() {
    let favorArray = wx.getStorageSync(def.Favor);
    if (favorArray == "") favorArray = [];
    const resIndex = favorArray.findIndex(obj => obj.contentid == this.data.contentid); //주의 number == string
    if( resIndex === -1 ) { // -1 찾지못함
      if(favorArray.length > def.maxFavor) {
        util.showModal("경고", "즐겨찾기의 갯수는\n " + def.maxFavor +"개를 넘을수 없습니다.", false)
        return;
      }
      favorArray = favorArray.concat(app.globalData.detailItem);
      wx.setStorageSync(def.Favor, favorArray)
      util.showToast("즐겨찾기에 추가");
      this.setData({ isFavor: true, })
    } else {
      favorArray.splice(resIndex, 1);
      wx.setStorageSync(def.Favor, favorArray)
      util.showToast("즐겨찾기에 삭제");
      this.setData({ isFavor: false, })
    }
  },
  getIsFavor() {
    let favorArray = wx.getStorageSync(def.Favor);
    if (favorArray == "") favorArray = [];
    return favorArray.findIndex(obj => obj.contentid == this.data.contentid) === -1?false:true //주의 number == string
  },

})