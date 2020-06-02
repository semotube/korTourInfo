//index.js
const api = require("../../utils/api.js");
const util = require("../../utils/util.js");
const app = getApp();

Page({
  data: {
    festivalList_Hot: [],//이미지 있는 조회순(인기순)
    festivalList_New: [],//수정일순(최신순)
    stayList_New: [],//수정일순(최신순)
  },

  onLoad: function () {
    this.loadData();
  },

  onPullDownRefresh: function(){
    wx.stopPullDownRefresh();
    this.loadData();
  },

  loadData() {
    let toDay = util.getToday();
    this.searchFestival("P", toDay, 10);//이미지 있는 조회순(인기순)
    this.searchFestival("C", toDay, 6);//수정일순(최신순)
    this.searchStay("C", toDay, 6);//수정일순(최신순)
  },

  searchFestival(arrange = "", eventStartDate = "", numOfRows = 10) {
    let that = this;
    api.request(api.SearchFestival, { arrange: arrange, eventStartDate: eventStartDate, numOfRows: numOfRows } )
    .then(function (res) {
      // console.log(res);
      if (res.response.header.resultMsg === "OK") {
        let item = res.response.body.items.item;
        if (!Array.isArray(item)) item = [item];
        // console.log("item : ", item)
        
        that.setData({
          festivalList_Hot: arrange === "P" ? item : that.data.festivalList_Hot,
          festivalList_New: arrange === "C" ? item : that.data.festivalList_New,
        })

      } else { 
        console.error("resultMsg != 'OK' : ", res.response.header.resultMsg);
        util.showModal("resultMsg != 'OK'", res.response.header.resultMsg, false);
      }
    })
    .catch(function (err) {
      console.error("catch : ", err);
      util.showModal("catch", res.response.header.resultMsg, false);
    })
  },

  searchStay(arrange = "", eventStartDate = "", numOfRows = 10) {
    let that = this;
    api.request(api.SearchStay, {
      arrange: arrange,
      eventStartDate: eventStartDate,
      numOfRows: numOfRows,
    }).then(function (res) {
      if (res.response.header.resultMsg === "OK") {
        let item = res.response.body.items.item;
        if (!Array.isArray(item)) item = [item];
        // console.log("item : ", item)
        that.setData({
          // stayList_Hot: arrange === "P" ? item : that.data.stayList_Hot,
          stayList_New: arrange === "C" ? item : that.data.stayList_New,
        })
        // util.hideLoading();
      } else { console.error("resultMsg != 'OK' : ", res.response.header.resultMsg) }
    })
      .catch(function (res) {
        // util.hideLoading();
        console.error("catch : ", res)
      })
  },

//bind Detail
////////////////////////////////////////////////////////////////////////////
  bindDetail(e) {
    let item = app.globalData.detailItem = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../search/detail/detail?contentid='+item.contentid+'&contenttypeid='+item.contenttypeid,
    })
  },

})
