// pages/search/search.js

const api = require("../../utils/api.js");
const def = require("../../utils/def.js");
const util = require("../../utils/util.js");
const code = require("../../utils/code.js");
const app = getApp()

class Tab {
  constructor(name) {
    this.name = name;
    this.conArray = [];//condition : 조건Array
    // this.keyword = "";
    this.resArray = [];//result : 결과Array
    this.numOfRows = 20;//페이지당 갯수
    this.pageNo = 0;//현재 페이지
    this.pageTot = 0;//전체 페이지 = totalCnt / numOfRows
    this.listYN = "N";//(Y=목록, N=개수)
  }
}

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    title: ["통합검색","행사검색","숙박검색","즐겨찾기"],
    TabCur: 0,
    tabArray: [],
  },
  
  initData(){
    this.setData({
      tabArray: [
        new Tab("통합검색"),
        new Tab("행사검색"),
        new Tab("숙박검색"),
        new Tab("즐겨찾기"),
      ],
    })

    let resCode = code.init();
// 통합검색     
    this.setData({
      [`tabArray[0].contentIndex`]: 0,
      [`tabArray[0].categoryIndex`]: [0, 0, 0],
      [`tabArray[0].areaIndex`]: [0, 0],
      [`tabArray[0].arrangeIndex`]: 0,
      [`tabArray[0].contentArray`]: resCode[0],
      [`tabArray[0].categoryArray`]: resCode[1],
      [`tabArray[0].areaArray`]: resCode[2],
      [`tabArray[0].arrangeArray`]: resCode[3],
      [`tabArray[0].keyword`]: "",
    })
// 행사검색 : Festival
    resCode = code.init4Festival();
    let toDay = util.getToday("-");//picker에서 예)2017-09-01 형식으로 사용.
    this.setData({
      [`tabArray[1].contentIndex`]: 3,//contentArray 3번 고정 { code: "15", name: "행사/공연/축제" },
      [`tabArray[1].categoryIndex`]: [0, 0, 0],
      [`tabArray[1].areaIndex`]: [0, 0],
      [`tabArray[1].arrangeIndex`]: 0,
      [`tabArray[1].categoryArray`]: resCode[0],
      [`tabArray[1].areaArray`]: resCode[1],
      [`tabArray[1].arrangeArray`]: resCode[2],
      // [`tabArray[1].today`]: toDay,
      [`tabArray[1].eventStartDate`]: toDay,
      [`tabArray[1].eventEndDate`]: toDay,
    })    
// 숙박검색 : Stay
    resCode = code.init4Stay();
    this.setData({
      [`tabArray[2].areaIndex`]: [0, 0],
      [`tabArray[2].stayIndex`]: 0,
      [`tabArray[2].arrangeIndex`]: 0,
      [`tabArray[2].areaArray`]: resCode[0],
      [`tabArray[2].stayArray`]: resCode[1],
      [`tabArray[2].arrangeArray`]: resCode[2],
    })
  },
  
  onLoad: function () {
    this.initData();
  },
  
  onShow() {
    if(app.globalData.isMyFavor) {
      this.setData({ TabCur: 3 })
      app.globalData.isMyFavor = false;
    }

    let needSearch = false;
    if(this.data.tabArray[0].categoryArray[0].length === 0 || this.data.tabArray[0].areaArray[0].length === 0) { //재확인
      this.initData();
      //배열 초기화 후 다시 한번 확인. 
      if(this.data.tabArray[0].categoryArray[0].length || this.data.tabArray[0].areaArray[0].length)
        needSearch = true;
      else
        return;
    }
    // 페이지가 보여질때 서버에 자료를 요구해야 하는 상황을 정의
    if(needSearch || !this.data.tabArray[this.data.TabCur].resArray.length || this.data.TabCur == 3 )
      this.bindSearch();
  },
  
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
    })
    if(this.data.tabArray[this.data.TabCur].resArray.length == 0)
      this.bindSearch();
  },

// modal 처리
//////////////////////////////////////////////////////  
  showModal(e) {
    if(!wx.getStorageSync(def.CategoryCode) && !wx.getStorageSync(def.AreaCode)) {
      wx.showModal({
        title: '코드가 존재하지 않습니다.',
        confirmColor: '#b4282d',
        content: '코드관리 페이지로 이동합니다.',
        showCancel: false,
        confirmText: "확인",
        complete: function () {
          wx.navigateTo({
            url: '/pages/user/code/code',
          })
        }
      })
    } else {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    }
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

// Bind Change 처리
////////////////////////////////////////////////////////////////////////////////
  contentChange(e) {
    let contentId = e.detail.value;
    this.setData({
      [`tabArray[${this.data.TabCur}].contentIndex`]: contentId,
      [`tabArray[${this.data.TabCur}].categoryIndex`]: [0, 0, 0],
      [`tabArray[${this.data.TabCur}].categoryArray`]: code.initCategoryArray(contentId),//contentId변경으로 인한 재설정.
    })
  },
  categoryColumnChange(e) {
    let contentIndex = this.data.tabArray[this.data.TabCur].contentIndex;
    let categoryIndex = this.data.tabArray[this.data.TabCur].categoryIndex;
    let categoryArray = this.data.tabArray[this.data.TabCur].categoryArray;
    let res = code.categoryColumnChange(contentIndex, categoryIndex, categoryArray, e);
    this.setData({
      [`tabArray[${this.data.TabCur}].categoryIndex`]: res[0],
      [`tabArray[${this.data.TabCur}].categoryArray`]: res[1],
    })
  },
  areaColumnChange(e) {
    let areaIndex = this.data.tabArray[this.data.TabCur].areaIndex;
    let areaArray = this.data.tabArray[this.data.TabCur].areaArray;
    let res = code.areaColumnChange(areaIndex, areaArray, e);
    this.setData({
      [`tabArray[${this.data.TabCur}].areaIndex`]: res[0],
      [`tabArray[${this.data.TabCur}].areaArray`]: res[1],
    })
  },  
  keywordChange(e) {
    this.data.tabArray[this.data.TabCur].keyword = e.detail.value;
  },
  arrangeChange(e) {
    this.setData({
      [`tabArray[${this.data.TabCur}].arrangeIndex`]: e.detail.value,
    })
  },
  eventStartDateChange(e) {
    this.setData({
      [`tabArray[${this.data.TabCur}].eventStartDate`]: e.detail.value,
    })
  },
  eventEndDateChange(e) {
    this.setData({
      [`tabArray[${this.data.TabCur}].eventEndDate`]: e.detail.value,
    })
  },
  stayChange(e) {
    this.setData({
      [`tabArray[${this.data.TabCur}].stayIndex`]: e.detail.value,
    })
  },


// search
//////////////////////////////////////////////////////
  bindSearch(type="reLoad") {
    //페이지 처리를 위해 전체갯수 파악 ==> "reLoad" 혹은 검색버튼 클릭시 : type.type==="tap"
    if(type==="reLoad" || type.type==="tap") {
      this.data.tabArray[this.data.TabCur].listYN = "N";
    }    
    
    this.hideModal();
    
    if(this.data.tabArray[this.data.TabCur].keyword) {
      if(this.data.tabArray[this.data.TabCur].keyword.length < 2) {
        util.showToast("검색어는 2글자이상\n\n 필요합니다.","none");
        return false;
      }
    }
    
    switch (this.data.TabCur) {
      case 0://searchKeyword : 통합검색 
        this.searchKeyword();
        break;
      case 1://searchFestival : 행사검색
        this.searchFestival();
        break;
      case 2://searchStay : 숙박검색
        this.searchStay();
        break;
      case 3://             즐겨찾기
        this.searchFavor();
        break;
      default: break;
    }
  },


  searchKeyword() {
    let that = this;
    let tab = that.data.tabArray[that.data.TabCur];
    let param = {
      contentTypeId: tab.contentArray[tab.contentIndex],
      cat1: tab.categoryArray[0][tab.categoryIndex[0]],
      cat2: tab.categoryArray[1][tab.categoryIndex[1]],
      cat3: tab.categoryArray[2][tab.categoryIndex[2]],
      areaCode: tab.areaArray[0][tab.areaIndex[0]],
      sigunguCode: tab.areaArray[1][tab.areaIndex[1]],
      keyword: tab.keyword,
      arrange: tab.arrangeArray[tab.arrangeIndex],
      numOfRows: tab.numOfRows,
      pageNo: tab.pageNo,
      listYN: tab.listYN,
    }
    //keyword가 있으면 SearchKeyword 없으면 AreaBasedList
    api.request(param.keyword != "" ? api.SearchKeyword : api.AreaBasedList, {
      contentTypeId: param.contentTypeId.code,
      cat1: param.cat1.code,
      cat2: param.cat2.code,
      cat3: param.cat3.code,
      areaCode: param.areaCode.code,
      sigunguCode: param.sigunguCode.code,
      keyword: param.keyword,
      arrange: param.arrange.code,
      numOfRows: param.numOfRows,
      pageNo: param.pageNo + 1,
      listYN: param.listYN,
    }).then(function (res) {
      // console.log("res : ", res)
      if (res.response.header.resultMsg === "OK") {
        let item = res.response.body.items.item;
        if (!Array.isArray(item)) item = [item];

        if( tab.listYN === "N" ) {
//처음(검색시작버튼)이거나 refresh이므로 pageTot계산후 첫 List를 다시 읽어드림.        
          if( item[0].totalCnt ) {
            that.setData({
              [`tabArray[${that.data.TabCur}].pageTot`]: Math.ceil(item[0].totalCnt/tab.numOfRows),
              [`tabArray[${that.data.TabCur}].listYN`]: "Y",//List
              [`tabArray[${that.data.TabCur}].resArray`]: [],//result 초기화.
              [`tabArray[${that.data.TabCur}].pageNo`]: 0,//현재페이지 초기화.
            })
			that.searchKeyword();//다시 읽어드림
          } else {
            util.showToast("NO 데이터","error");
          }
        } else {
//자료를 추가로 읽어드림 reLoad 상태        
          if(item != undefined) { 
            console.log("item : ", item);
            that.setData({
              [`tabArray[${that.data.TabCur}].resArray`]: tab.resArray.concat( item ),
              [`tabArray[${that.data.TabCur}].pageNo`]: tab.pageNo + 1,//페이지+1.
            })
          } else {  
            util.showToast("NO 데이터","error");
          }
        }
        util.hideLoading();
      } else { console.error("resultMsg != 'OK' : ", res.response.header.resultMsg) }
    })
    .catch(function (res) {
      util.hideLoading();
      console.error("catch : ", res)
    })
  },

  searchFestival() {
    let that = this;
    let tab = that.data.tabArray[that.data.TabCur];
    api.request(api.SearchFestival, {
      cat1: tab.categoryArray[0][tab.categoryIndex[0]].code,
      cat2: tab.categoryArray[1][tab.categoryIndex[1]].code,
      cat3: tab.categoryArray[2][tab.categoryIndex[2]].code,
      areaCode: tab.areaArray[0][tab.areaIndex[0]].code,
      sigunguCode: tab.areaArray[1][tab.areaIndex[1]].code,
      eventStartDate: util.replaceDate(tab.eventStartDate),//ex)20200520
      eventEndDate: util.replaceDate(tab.eventEndDate),//ex)20200520
      arrange: tab.arrangeArray[tab.arrangeIndex].code,
      numOfRows: tab.numOfRows,
      pageNo: tab.pageNo + 1,
      listYN: tab.listYN,
    }).then(function (res) {
      // console.log("res : ", res)
      if (res.response.header.resultMsg === "OK") {
        let item = res.response.body.items.item;
        if (!Array.isArray(item)) item = [item];

        if( tab.listYN === "N" ) {
//처음(검색시작버튼)이거나 refresh이므로 pageTot계산후 첫 List를 다시 읽어드림.
          if( item[0].totalCnt ) { 
            that.setData({
              [`tabArray[${that.data.TabCur}].pageTot`]: Math.ceil(item[0].totalCnt/tab.numOfRows),
              [`tabArray[${that.data.TabCur}].listYN`]: "Y",//List
              [`tabArray[${that.data.TabCur}].resArray`]: [],//result 초기화.
              [`tabArray[${that.data.TabCur}].pageNo`]: 0,//현재페이지 초기화.
            })
            that.searchFestival();//다시 읽어드림
          } else {
            util.showToast("NO 데이터","error");
          }
        } else {
//자료를 추가로 읽어드림 reLoad 상태
          if(item != undefined) { 
            console.log("searchFestival() item : ", item)
            that.setData({
              [`tabArray[${that.data.TabCur}].resArray`]: tab.resArray.concat( item ),
              [`tabArray[${that.data.TabCur}].pageNo`]: tab.pageNo + 1,//페이지+1.
            })
          } else {  
            util.showToast("NO 데이터","error");
          }
        }
        util.hideLoading();
      } else { console.error("resultMsg != 'OK' : ", res.response.header.resultMsg) }
    })
    .catch(function (res) {
      util.hideLoading();
      console.error("catch : ", res)
    })
  },

  searchStay() {
    let that = this;
    let tab = that.data.tabArray[that.data.TabCur];
    api.request(api.SearchStay, {
      areaCode: tab.areaArray[0][tab.areaIndex[0]].code,
      sigunguCode: tab.areaArray[1][tab.areaIndex[1]].code,
      goodStay: tab.stayIndex == 1 ? 1 : 0,// index 순서주의
      hanOk: tab.stayIndex == 2 ? 1 : 0,
      benikia: tab.stayIndex == 3 ? 1 : 0,
      arrange: tab.arrangeArray[tab.arrangeIndex].code,
      numOfRows: tab.numOfRows,
      pageNo: tab.pageNo + 1,
      listYN: tab.listYN,
    }).then(function (res) {
      if (res.response.header.resultMsg === "OK") {
        let item = res.response.body.items.item;
        if (!Array.isArray(item)) item = [item];

        if( tab.listYN === "N" ) {
//처음(검색시작버튼)이거나 refresh이므로 pageTot계산후 첫 List를 다시 읽어드림.
          if( item[0].totalCnt ) { 
            that.setData({
              [`tabArray[${that.data.TabCur}].pageTot`]: Math.ceil(item[0].totalCnt/tab.numOfRows),
              [`tabArray[${that.data.TabCur}].listYN`]: "Y",//List
              [`tabArray[${that.data.TabCur}].resArray`]: [],//result 초기화.
              [`tabArray[${that.data.TabCur}].pageNo`]: 0,//현재페이지 초기화.
            })
            that.searchStay();//다시 읽어드림
          } else {
            util.showToast("NO 데이터","error");
          }
        } else {
//자료를 추가로 읽어드림 reLoad 상태
          if(item != undefined) { 
            console.log("searchStay() item : ", item)
            that.setData({
              [`tabArray[${that.data.TabCur}].resArray`]: tab.resArray.concat( item ),
              [`tabArray[${that.data.TabCur}].pageNo`]: tab.pageNo + 1,//페이지+1.
            })
          } else {  
            util.showToast("NO 데이터","error");
          }
        }
        util.hideLoading();
      } else { console.error("resultMsg != 'OK' : ", res.response.header.resultMsg) }
    })
    .catch(function (res) {
      util.hideLoading();
      console.error("catch : ", res)
    })    
  },

  searchFavor() {
    let that = this;
    let item = wx.getStorageSync(def.Favor);
    if (item == "") item = [];
    that.setData({
      [`tabArray[${that.data.TabCur}].pageTot`]: 1,
      [`tabArray[${that.data.TabCur}].resArray`]: item,
      [`tabArray[${that.data.TabCur}].pageNo`]: 1,
    })
  },    

//처리
/////////////////////////////////////////////////////////////////////////////////
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh();
    if(this.data.tabArray[this.data.TabCur].resArray.length === 0) {
      return;
    }
    this.bindSearch();
  },
  onReachBottom() {
    if(this.data.tabArray[this.data.TabCur].resArray.length === 0) {
      return;
    }
    let tab = this.data.tabArray[this.data.TabCur];
    if (tab.pageTot > tab.pageNo) {
      this.bindSearch("loadPage");
    } else {
      wx.showToast({
        title: '자료의 끝입니다.',
        icon: 'none',
        duration: 2000
      });
    }
  },

//bind Detail
  bindDetail(e) {
    let item = app.globalData.detailItem = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: './detail/detail?contentid='+item.contentid+'&contenttypeid='+item.contenttypeid,
    })
  }  

})