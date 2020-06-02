//app.js
App({

  onLaunch: function () {

    // wx.getSystemInfo({
    //   success: e => {
    //     // console.log(e);
    //     this.globalData.StatusBar = e.statusBarHeight;
    //     let custom = wx.getMenuButtonBoundingClientRect();
    //     console.log('custom : ', custom);
    //     this.globalData.Custom = custom;
    //     this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
    //   }
    // });


    // 2.11.0버젼: getMenuButtonBoundingClientRect()값이 전부 0이 자주 나옴(핸드폰 테스트시)
    // 우선 아래 소스를 이용해서 처리.
    wx.getSystemInfo({
      success: e => {
        if (!wx.canIUse('getMenuButtonBoundingClientRect')) {
          wx.showModal({ title: 'Error', content: "can't use getMenuButtonBoundingClientRect()" })
        }

        let IS_ERROR = false;
        let custom = null;
        try {
          custom = wx.getMenuButtonBoundingClientRect();
          if (custom && custom.height) {
            if (custom.bottom == 0 || custom.top == 0) { IS_ERROR = true; }
            else { wx.setStorageSync("customInfo", custom) }
          } else { IS_ERROR = true; }
        } catch (e) { IS_ERROR = true; }

        let defaultCustom = { width: 87, height: 32, left: 317, top: 50, right: 404, bottom: 82 }
        if (IS_ERROR) { custom = wx.getStorageSync("customInfo") || defaultCustom }
        this.globalData.StatusBar = e.statusBarHeight;
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
        this.globalData.BoxHeight = e.windowHeight - this.globalData.CustomBar;
        this.globalData.ISIPX = false;

        let x = e.model.toLowerCase().replace(/ /g, '');
        if (x.indexOf('iphonex') > -1 || x.indexOf('iphone1') > -1) {
          this.globalData.BoxHeight = this.globalData.BoxHeight - 34; //iphone x
          this.globalData.ISIPX = true;
        }
      },
    });

  },
  globalData: {
    detailItem: null,
    isMyFavor: false,
  }
})