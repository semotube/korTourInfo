// api.js
const util = require("./util.js");

const url = "http://api.visitkorea.or.kr/openapi/service/rest/KorService/";
const key ="429e9l%2BRPBvvMYSqI0TIu0JgvFl1vio2dcUfXj7d66%2F%2B2glco1EDs1HDHJBssw9U7HAt1A11Cy6N0Hbk2INDfQ%3D%3D";//인터넷에서.


function request(url, data = {}, method = "GET") {
  util.showLoading('조회중...');
  data.MobileOS = "ETC";
  data.MobileApp = "testApp";
  data._type = "json";
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {

          let resultMsg = "정상";
          let resultCode = res.data.response.header.resultCode;
          switch (resultCode) {
            case 1: resultMsg = "어플리케이션 에러"; break;
            case 2: resultMsg = "데이터베이스 에러"; break;
            case 3: resultMsg = "데이터없음 에러"; break;
            case 4: resultMsg = "HTTP 에러"; break;
            case 5: resultMsg = "서비스 연결실패 에러"; break;
            case 10: resultMsg = "잘못된 요청 파라메터 에러"; break;
            case 11: resultMsg = "필수요청 파라메터가 없음"; break;
            case 12: resultMsg = "해당 오픈API서비스가 없거나 폐기됨"; break;
            case 20: resultMsg = "서비스 접근거부"; break;
            case 21: resultMsg = "일시적으로 사용할 수 없는 서비스 키"; break;
            case 22: resultMsg = "서비스 요청제한횟수 초과에러"; break;
            case 30: resultMsg = "등록되지 않은 서비스키"; break;
            case 31: resultMsg = "기한만료된 서비스키"; break;
            case 32: resultMsg = "등록되지 않은 IP"; break;
            case 33: resultMsg = "서명되지 않은 호출"; break;
            case 99: resultMsg = "기타에러"; break;
          }

          if (resultCode != 0) {
            util.hideLoading();
            util.showModal("ERROR", resultMsg, false);
            reject(res);
          } else {
            util.hideLoading();
            resolve(res.data);
          }
        } else {
          util.hideLoading();
          reject(res.errMsg);
        }
      },
      fail: function (err) {
        util.hideLoading();
        reject(err)
      }
    })
  });
}

module.exports = {
  request,
  AreaCode: url + "areaCode" + "?serviceKey=" + key,//지역코드조회
  CategoryCode: url + "categoryCode" + "?serviceKey=" + key,//서비스 분류코드 조회
  AreaBasedList: url + "areaBasedList" + "?serviceKey=" + key,
  LocationBasedList: url + "locationBasedList" + "?serviceKey=" + key,
  SearchKeyword: url + "searchKeyword" + "?serviceKey=" + key,
  SearchFestival: url + "searchFestival" + "?serviceKey=" + key,//행사정보 조회
  SearchStay: url + "searchStay" + "?serviceKey=" + key,//숙박정보 조회
  DetailCommon: url + "detailCommon" + "?serviceKey=" + key,
  DetailIntro: url + "detailIntro" + "?serviceKey=" + key,
  DetailInfo: url + "detailInfo" + "?serviceKey=" + key,
  DetailImage: url + "detailImage" + "?serviceKey=" + key,
}