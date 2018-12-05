// pages/payments/index.js

const util_time = require('../../utils/time.js');
const util_interface = require('../../utils/interface.js');
const util_handle = require('../../utils/handle.js');

const app = getApp();
const today = new Date();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_display: {
      title_image_src: "../../resources/payment/title.png",
      date_image_src: "../../resources/payment/date.png",
      up_arrow_image_src: "../../resources/payment/up_arrow.png",
      down_arrow_image_src: "../../resources/payment/down_arrow.png",
      to_top_image_src: "../../resources/to_top.png",
      pull_down_image_src: "../../resources/auxiliary/pull_down.png",
      min_date: "2015-01-01",
      max_date: util_time.dateFtt("yyyy-MM-dd", today),
      pmnt_meth_arr: ["全部", "手机微信支付", "Paypal", "积分支付", "Sofort", "微信支付", "国际支付宝", "支付宝", "银联支付"],
      pmnt_type_arr: ["全部", "运单", "补款", "会员升级", "retour单", "包装材料订单"],
      type_link: "运单",
      mobile_height: 666.66,
      mobile_width: 500.11,
      to_top_png: true
    },
    search_form:{
      pnum: '',
      tx_num: '',
      start_date: util_time.getDateStep(today,-30),
      end_date: util_time.dateFtt("yyyy-MM-dd", today),
      pmnt_meth: '',
      pmnt_type: '',
    },
    payments_data:{
      list: [],
      total_num: 0,
      payments_num: 0,
      current_page: 1,
      summary_hash: {}
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("index onLoad")
    // 异步请求 存在先后情况
    if (app.globalData.uid) {
      console.log("sync global uid: " + app.globalData.uid)
      this.setData({
        "payments_data.list": app.globalData.initPayments.payment_list,
        "payments_data.total_num": app.globalData.initPayments.total_num,
        "payments_data.payments_num": app.globalData.initPayments.payments_num,
        "payments_data.current_page": 1,
        "payments_data.summary_hash": app.globalData.initPayments.summary_hash,
      })
    }
    else {
      console.log("async callback uid")
      app.signInPaymentsCallback = res => {
        this.setData({
          "payments_data.list": res.payment_list,
          "payments_data.total_num": res.total_num,
          "payments_data.payments_num": res.payments_num,
          "payments_data.current_page": 1,
          "payments_data.summary_hash": res.summary_hash
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("index onShow")
    if (app.globalData.page_on_hide) {
      app.globalData.page_on_hide = false
      console.log("onShow from hide")
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            util_interface.getPaymentList(app.globalData, this, this.data.search_form, "confirm")
          }
          else {
            console.log("login failure no code: " + res);
            util_handle.showLoginFailToast()
          }
        }
      })
    }

    if (this.data.page_display.mobile_height == 666.66) {
      var _this = this
      wx.getSystemInfo({
        success: function (res) {
          if (res.windowHeight > 400) {
            _this.setData({
              "page_display.mobile_height": res.windowHeight,
              "page_display.mobile_width": res.windowWidth
            })
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("index onHide")
    app.globalData.page_on_hide = true
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面滚动函数
   */
  onPageScroll: function (e) {    // Do something when page scroll
    if (e.scrollTop > this.data.page_display.mobile_height) {
      if (this.data.page_display.to_top_png == true)
        this.setData({ "page_display.to_top_png": false })
    }
    else {
      if (this.data.page_display.to_top_png == false)
        this.setData({ "page_display.to_top_png": true })
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //设置前台显示最大笔数50
    if (this.data.payments_data.current_page > 5) {
      util_handle.showFailToast("请输入具体条件查询", 1000)
      return
    }
    else if (this.data.payments_data.current_page >= this.data.payments_data.payments_num) {
      util_handle.showFailToast("没有更多数据", 1000)
      return
    }

    util_interface.getPaymentList(app.globalData, this, this.data.search_form, "onReachBottom")
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },



  /***
   * 日期选择器
   */
  bindPickerChange: function (e) {
    console.log(e)
    var var_name = ""
    var var_value = e.detail.value
    // 只能进行3个月-90天数据统计
    if (e.target.id == "search_end_date"){
      var_name = "search_form.end_date"

      var beg_value = this.data.search_form.start_date
      var allow_value = util_time.getDateStep(new Date(var_value), -90)
      console.log(allow_value + "<->"+ beg_value)
      if (new Date(beg_value) < new Date(allow_value)){
        this.setData({
          "search_form.start_date": allow_value
        })
      }
    }
    else if (e.target.id == "search_start_date"){
      var_name = "search_form.start_date"

      var end_value = this.data.search_form.end_date
      var allow_value = util_time.getDateStep(new Date(var_value), 90)
      console.log(allow_value + "<->" + end_value)
      if (new Date(end_value) > new Date(allow_value)) {
        this.setData({
          "search_form.end_date": allow_value
        })
      }
    }
    else if (e.target.id == "pmnt_meth_picker") {
      var_name = "search_form.pmnt_meth"
      if (e.detail.value == 0)
        var_value = ""
      else
        var_value = this.data.page_display.pmnt_meth_arr[e.detail.value]
    }
    else if (e.target.id == "pmnt_type_picker") {
      var_name = "search_form.pmnt_type"
      if(e.detail.value==0)
        var_value = ""
      else
        var_value = this.data.page_display.pmnt_type_arr[e.detail.value]
    }
    console.log(var_name+" -> "+var_value)
    if (var_name != "") {
      this.setData({
        [var_name]: var_value
      })
    }
  },

  /***
   * 相关包裹 显示箭头 点击事件
   */
  catchRetNumTap: function(e) {
    var var_name = "payments_data.list["+e.currentTarget.dataset.id+"].part_flag"
    this.setData({
      [var_name]: !this.data.payments_data.list[e.currentTarget.dataset.id].part_flag
    })
  },


  /***
   * 相关包裹 显示所有
   */
  catchDisplayAllTap: function (e) {
    var var_name = "payments_data.list[" + e.currentTarget.dataset.id + "].all_flag"
    this.setData({
      [var_name]: !this.data.payments_data.list[e.currentTarget.dataset.id].all_flag
    })
  },

  /***
   * 相关包裹点击跳转详情页面
   */
  catchPnumTap: function(e){
    if (e.currentTarget.dataset.pmnt_type != this.data.page_display.type_link) {
      console.log("conflict 不跳转")
      return;
    }

    var show_flag = 0
    wx.showLoading({
      title: "获取包裹详细信息...",
      mask: true
    })
    show_flag += 1

    wx.navigateTo({
      url: '../parcels/info?pnum=' + e.currentTarget.dataset.pnum,
      fail: function (res) {
        util_handle.showFailToast("查询包裹相信异常,请稍后再试", 1000)
        show_flag -= 1
      },
    })
  },

  /**
   * 查询事件
   */
  bindSearch: function (e) {
    console.log(e.detail.value)
    // 设置变量
    this.setData({
      "search_form.pnum": e.detail.value.pnum,
      "search_form.tx_num": e.detail.value.tx_num,
      "search_form.start_date": e.detail.value.start_date,
      "search_form.end_date": e.detail.value.end_date,
      "search_form.pmnt_meth": this.data.page_display.pmnt_meth_arr[e.detail.value.pmnt_meth] || "",
      "search_form.pmnt_type": this.data.page_display.pmnt_type_arr[e.detail.value.pmnt_type] || ""
    })

    util_interface.getPaymentList(app.globalData, this, this.data.search_form, "confirm")
  },

  /**
   * 返回顶部
   */
  catchToTopTap: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  }
})