// pages/parcels/index.js
const util_interface = require('../../utils/interface.js');
const util_time = require('../../utils/time.js');
const util_proc = require('../../utils/proc.js');
const util_handle = require('../../utils/handle.js');

const app = getApp();
const today = new Date();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden_flag:{
      search: true,
      screen: true,
      conflict: false,
      to_top_png: true,
      app_env: app.globalData.env,
    },
    page_display:{
      input_width: "",
      title_image_src: "../../resources/title_icon.png",
      search_simple_value: "输入要查询的收件人",
      search_image_src: "../../resources/search.png",
      search_more_image_src: "../../resources/search_more.png",
      screen_image_src: "../../resources/screen.png",
      follow_image_src: "../../resources/follow.png",
      no_follow_image_src: "../../resources/no_follow.png",
      download_image_src: "../../resources/download.png",
      mobile_height: 666.66,
      mobile_width: 500.11,
      to_top_image_src: "../../resources/to_top.png",
    },
    sm_display:{
      btn_disabled: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      con_date_step: 0,
      con_date: ["三天内", "一周内", "一月内"],
      con_logistics_step: 3,
      con_logistics: ["奶粉专线", "杂货包税", "DHL优先", "DHL经济", "捷克邮政", "中德快件","小包奶粉","食品保健品"],
      con_payment_step: 11,
      con_payment: ["支付成功", "支付中", "需要补款"],
      con_parcel_status_step: 14,
      con_parcel_status: ["被拦截", "已取消", "申请取消"],
      con_rcpt_country_step: 17,
      con_rcpt_country: ["中国","德国","其他"]
    },
    search_display:{
      start_date: "",
      end_date: "",
      min_date: "2015-01-01",
      max_date: util_time.dateFtt("yyyy-MM-dd",today),
      date_image_src: "../../resources/date.png",
      input_pnum: '',
      input_snum: '',
      input_rcpt: '',
    },
    parcels_data:[],
    parcels_num: 0, //总页数
    current_page: 0,
    simple_input_value: ''
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
        parcels_data: app.globalData.initParcels.parcels_data,
        parcels_num: app.globalData.initParcels.parcels_num,
        current_page: 1
      })
    }
    else {
      console.log("async callback uid")
      app.signInParcelsCallback = res => {
        this.setData({
          parcels_data: res.parcels_data,
          parcels_num: res.parcels_num,
          current_page: 1
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("index onReady")
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("index onShow")
    if (app.globalData.page_on_hide){
      app.globalData.page_on_hide = false
      console.log("onShow from hide")
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            util_interface.userLoginFromShow(app.globalData, res.code, this);
          }
          else {
            console.log("login failure no code: " + res);
            util_handle.showLoginFailToast()
          }
        }
      })
    }

    if (this.data.page_display.mobile_height == 666.66){
      var _this = this
      wx.getSystemInfo({
        success: function(res) {
          if (res.windowHeight>400){
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
    console.log("index onUnload")
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
      if (this.data.hidden_flag.to_top_png == true)
        this.setData({"hidden_flag.to_top_png": false})
    }
    else {
      if (this.data.hidden_flag.to_top_png == false)
        this.setData({ "hidden_flag.to_top_png": true })
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("onReachBottom")
    if(this.data.hidden_flag.search == false || this.data.hidden_flag.screen == false)
      return;
    //设置前台显示最大笔数50
    if (this.data.current_page > 5){
      util_handle.showFailToast("请输入具体条件查询", 1000)
      return 
    }
    else if(this.data.current_page >= this.data.parcels_num){
      util_handle.showFailToast("没有更多数据", 1000)
      return 
    }

    console.log("input value:" + this.data.simple_input_value)
    if (this.data.simple_input_value!=""){
      console.log("simple_input_value:" + this.data.simple_input_value)
      util_interface.getParcelList(app.globalData, this, this.data.simple_input_value, "", "", "", "","onReachBottom")
    }
    else{
      util_interface.getParcelList(app.globalData, this, this.data.search_display.input_rcpt, this.data.search_display.input_pnum, this.data.search_display.input_snum, this.data.search_display.start_date, this.data.search_display.end_date, "onReachBottom")
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 弹出 更多选择页面
   */
  catchSearchMoreTap: function(e){
    console.log("catchSearchMoreTap to set hidden_flag.search")
    this.setData({
      "hidden_flag.search": false,
      "page_display.input_width": "55rpx",
      "hidden_flag.conflict": true,
    })
  },

  /**
   * 弹出 筛选选择框
   */
  catchScreenTap: function (e) {
    console.log("catchScreenTap to set hidden_flag.screen")
    this.setData({
      "hidden_flag.screen": false,
      "page_display.input_width": "55rpx",
      "hidden_flag.conflict": true,
    })
  },

  /**
   * 关闭 更多选择页面
   */
  catchContainerTap: function(e){
    console.log("catchContainerTap")
    if (!this.data.hidden_flag.screen){
      console.log("return index page from screen")
      this.setData({
        "hidden_flag.screen": true,
        "page_display.input_width": "",
      })
    }
    else if (!this.data.hidden_flag.search){
      console.log("return index page from search")
      this.setData({
        "hidden_flag.search": true,
        "page_display.input_width": "",
      })
    }
  },

  /**
   * 更多选择页面中 按钮点击事件,修改按钮状态,改变样式
   */
  catchSmBtnTap: function (e) {
    console.log(e)

    wx.showLoading({
      title: "筛选中",
      mask: true
    })

    //修改本次的条件
    var btn_dis_array = this.data.sm_display.btn_disabled
    btn_dis_array = util_proc.chooseBtn(btn_dis_array, e.target.id)

    //改变 按钮颜色
    //变量作为key值的时候要用[ ] 
    this.setData({
      "sm_display.btn_disabled": btn_dis_array,
    })

    //循环所有包裹数据进行是否隐藏操作
    var parcel_h = {}
    var is_hidden = false
    for (var j = 0, len = this.data.parcels_data.length; j < len; j++) {
      parcel_h = this.data.parcels_data[j]
      //传入所有条件 进行筛选
      is_hidden = util_proc.chooseParcel(this.data.parcels_data[j], btn_dis_array)
      //console.log(parcel_h.isHidden + "<->"+ is_hidden)
      if (parcel_h.isHidden != is_hidden){
        var var_name="parcels_data["+j+"].isHidden"
        this.setData({
          [var_name] : is_hidden
        })
      }
    }

    wx.hideLoading()
  },

  /**
   * 下载文件
   */
  catchDownloadTap: function(e){
    if(!e.target.dataset.can){
      util_handle.showFailToast("文件尚未产生,请稍后操作", 1000)
      return
    }

    var parcel_num = e.target.dataset.pnum
    
    // util_interface.download(app.globalData, "shpmt_file", parcel_num)
    util_interface.downloadOpen(app.globalData, "posting_file", parcel_num)
  },

  /**
   * 日期选择器
   */
  bindDateChange: function (e) {
    var var_name = ""
    if(e.target.id == "search_end_date")
      var_name = "search_display.end_date"
    else if (e.target.id == "search_start_date")
      var_name = "search_display.start_date"

    if (var_name != "") {
      this.setData({
        [var_name]: e.detail.value
      })
    }
  },

  /**
   * 界面 关注点击事件
   */
  catchFollowTap: function(e){
    util_interface.followParcel(app.globalData, this, e.currentTarget.dataset.pnum, e.currentTarget.dataset.follow, e.currentTarget.dataset.id)
  },

  /**
   * 查询事件
   */
  bindSearch: function(e){
    console.log(e.detail.value)
    if(e.type=="confirm")
      util_interface.getParcelList(app.globalData, this, e.detail.value, "", "", "", "","simple")
    else{
      //按钮提交
      var value_h = e.detail.value
      util_interface.getParcelList(app.globalData, this, value_h.rcpt, value_h.parcel_num, value_h.shpmt_num, value_h.start_time, value_h.end_time,"complex")
    }
  },

  /**
   * 跳转包裹详细信息
   */
  bindParcelInfoTap: function(e){
    console.log("into bindParcelInfoTap");
    console.log(e)
    if(this.data.hidden_flag.conflict){
      console.log("conflict 不跳转")
      this.setData({
        "hidden_flag.conflict": false
      })
      return;
    }
    var show_flag = 0
    wx.showLoading({
      title: "获取包裹详细信息...",
      mask: true
    })
    show_flag+=1

    wx.navigateTo({
      url: 'info?pnum='+e.currentTarget.id,
      fail: function(res){
        util_handle.showFailToast("查询包裹相信异常,请稍后再试", 1000)
        show_flag -= 1
      },
      // complete: function(res){
      //   if(show_flag>=1)
      //     wx.hideLoading()
      // }
    })
  },

  /**
   * 弹出页面时,禁止用户上下滑动
   */
  catchTouchStopMove: function(e){
  },

  /**
   * 返回顶部
   */
  catchToTopTap: function(e){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  /**
   * 测试环境使用 -- 跳转到计价界面
   */
  catchToCalcPriceTap: function(e){
    wx.navigateTo({
      url: '../auxiliary/valuation',
    })
  }
})