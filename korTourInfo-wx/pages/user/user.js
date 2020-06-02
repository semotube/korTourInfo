// pages/user/user.js
const util = require("../../utils/util.js");
const app = getApp()

Page({

  data: {
    hasLogin: false,
    userInfo: {},
  },

  onLoad: function (options) {
    this.setData4Login(wx.getStorageSync('userInfo'));
  },

  setData4Login(userInfo="") {
    var data = {
      hasLogin: false,
      userInfo: { avatarUrl: 'http://yanxuan.nosdn.127.net/8945ae63d940cc42406c3f67019c5cb6.png', nickName: '로그인이 필요합니다.' }
    };
    if( userInfo ) {
      data.hasLogin = true;
      data.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
    } else {
      data.hasLogin = false;
      data.userInfo = data.userInfo;
      wx.removeStorageSync('userInfo');
    }
    this.setData(data);
  },


  logIn(e) {
    console.log("e.detail.userInfo : ", e.detail.userInfo);
    if (e.detail.userInfo == undefined) {
      util.showToast('유저정보 실패!',"ERROR");
      return;
    }
    this.setData4Login(e.detail.userInfo);
    util.showToast("로그인 성공!")    
  },

  logOut(e) {
    let that = this;
    wx.showModal({
      title: 'LogOut',
      confirmColor: '#b4282d',
      content: '로그아웃 하시겠습니까？',
      cancelText: "취소",
      confirmText: "확인",
      success: function (res) {
        if (res.confirm) {
          that.setData4Login("");
        }
      }
    })
  },

  //즐겨찾기 페이지로 이동
/////////////////////////////////////////////////////////////////////////////
  myFavor() {
    app.globalData.isMyFavor = true;
    wx.switchTab({// tab 페이지는 switchTab를 사용
      // url: "/pages/search/search?type='myFavor'",//switchTab queryString지원하지 않음
      url: "/pages/search/search",
    })
  },



})