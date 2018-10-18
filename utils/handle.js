function showAuthFailToast(){
  showFailToast('授权失败,请重新操作', 2000)
}

function showLoginFailToast() {
  showFailToast('登入失败,请重新进入小程序', 5000)
}

function showFailInterfaceToast(){
  showFailToast('获取信息失败,请稍后重试', 5000)
}

function showFailToast(title, display_time) {
  wx.showToast({
    title: title,
    icon: 'none',
    mask: true,
    duration: display_time
  })
}

function showModalSingleButton(title, content) {
  wx.showModal({
    title: title,
    content: content,
    showCancel: false,
    confirmText: '确定'
  })
}

function showModalSingleButtonAndExit(title, content) {
  wx.showModal({
    title: title,
    content: content,
    showCancel: false,
    confirmText: '确定',
    complete: function (res) {
      wx.navigateBack({
        delta: -1
      })
    }
  })
}

module.exports = {
  showAuthFailToast: showAuthFailToast,
  showLoginFailToast: showLoginFailToast,
  showFailInterfaceToast: showFailInterfaceToast,
  showFailToast: showFailToast,
  showModalSingleButton: showModalSingleButton,
  showModalSingleButtonAndExit: showModalSingleButtonAndExit
}