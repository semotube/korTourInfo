const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getToday = (txt = '') => { //문자를 입력 받아 그 문자로 처리.
  let date = new Date();//new Date('December 25, 1995 23:15:30');
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(formatNumber).join(txt);//join('-');
}

function replaceDate(date_str)
{
  if(date_str===undefined) return;
  return date_str.replace(/-/gi,"");
}

const showLoading = msg => {
  wx.showLoading({
    title: msg,
    mask: true
  })
}
const hideLoading = () => {
  wx.hideLoading();
}
const showModal = (title, content, showCancel = true, mask = true, cancelText = "취소", confirmText = "확인") => {
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    mask: mask,
    cancelText: cancelText,
    confirmText: confirmText,
  })
}

const showToast = (msg, image="SUCCESS", duration=2000) => {
  wx.showToast({
    title: msg,
    image: image === "SUCCESS" ? "/resources/images/success.png" : "/resources/images/error.png",
    duration: duration,
  })
}
const hideToast = () => {
  wx.hideToast();
}


module.exports = {
  formatTime: formatTime,
  getToday: getToday,
  replaceDate,
  showLoading,
  hideLoading,
  showModal,
  showToast,
  hideToast,
}
