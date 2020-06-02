// pages/searchStay/searchStay.js
Page({

  data: {
    stayArray: null,
  },

  onLoad: function () {
  },

  reqStay() {
    wx.showLoading({
      title: '조회중...',
    })

    var serviceKey = '?serviceKey=Yf5NXdsSZLmRUKZwRF01ZF83ZEVX7GG%2B54cCW3KIHC6Vb7i8OXj2vJTZAqULvt5hH5fgUkARqzcd4YyIAVG54Q%3D%3D';
    var url = 'http://api.visitkorea.or.kr/openapi/service/rest/KorService/searchStay' + serviceKey;

    var that = this;
    wx.request({
      url: url,
      data: {
        numOfRows: 100,
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'testApp',
        _type: 'json',
      },
      method: "GET",
      header: {
        'content-type': 'application/json' // Default value
      },
      success: function (res) {
        console.log(res.data);
        if (res.statusCode == 200) {
          that.setData({
            stayArray: res.data.response.body.items.item,
          })
        } else {
          that.setData({
            stayArray: null,
          })
        }
        wx.hideLoading();
      },
      fail: function (err) {
        wx.hideLoading();
      }
    })
  },
})