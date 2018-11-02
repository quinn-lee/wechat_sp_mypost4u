const util_interface = require('../../utils/interface.js');

const app = getApp();

// pages/parcels/info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_display:{
      info_image_src: "../../resources/info.png",
      arrow_image_src: "../../resources/down_arrow.png",
      d_arrow_image_src: "../../resources/down_arrow.png",
      u_arrow_image_src: "../../resources/up_arrow.png",
      tracking_dot_image_src: "../../resources/tracking_dot.png",
      tracking_get_image_src: "../../resources/tracking_get.png",
      tracking_unget_image_src: "../../resources/tracking_unget.png",
      tracking_car_image_src: "../../resources/tracking_car.png",
      detail_title: [1, 0, 0],
      detail_title_1_sender: 0,
      detail_title_1_desc: "展开",
      tracking_line: 78,
      tracking_height_unit: 74,
      tracking_info_arr: [],
      tracking_dotted_line_length: 74+30,
      item_display_arr: []
    },
    api_call: [false,false],
    parcel_info:{},
    parcel_add_info: {
      status: "",
      shpmtStatus: "",
      payStatus: "",
      tracking_info: []
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("info onLoad")
    console.log(options)
    app.globalData.page_on_hide = false

    if(options.pnum==""){
      wx.navigateBack({
        delta: -1
      })
      return
    }
    // 设置最重要的包裹编号
    this.setData({
      "parcel_info.parcelNum": options.pnum
    })

    util_interface.parcelInfo(app.globalData, this)
    util_interface.parcelTrackingInfo(app.globalData, this)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("info onReady")
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (Object) {
    console.log("info onShow:")
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("info onHide")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("info onUnload")
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("onPullDownRefresh")
    if (this.data.parcel_info.parcelNum=="")
      return;

    util_interface.parcelInfo(app.globalData, this)
    util_interface.parcelTrackingInfo(app.globalData, this)

    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 包裹详细信息-标题点击选择触发
   */
  catchDetailTitleTap: function(e){
    //收寄件人界面中的 展开寄件人
    if (e.target.id == "showSender" || e.target.id == "showSenderArrow"){
      var new_value = 1 - this.data.page_display.detail_title_1_sender
      //展开
      if (new_value == 1){
        this.setData({
          "page_display.detail_title_1_desc": "收起",
          "page_display.detail_title_1_sender": new_value,
          "page_display.arrow_image_src": this.data.page_display.u_arrow_image_src
        })
      }
      else{
        this.setData({
          "page_display.detail_title_1_desc": "展开",
          "page_display.detail_title_1_sender": new_value,
          "page_display.arrow_image_src": this.data.page_display.d_arrow_image_src
        })
      }
    }
    else{
      // 标题切换
      var detail_title = [0, 0, 0]
      detail_title[e.target.id] = 1
      //console.log(detail_title)
      this.setData({
        "page_display.detail_title": detail_title
      })
    }
  },

  /**
   * 物品详情中,点击名称字段触发,显示其他属性
   */
  catchItemDetailTap: function(e){
    console.log(e)
    var new_item_arr = this.data.page_display.item_display_arr
    new_item_arr[e.currentTarget.dataset.id] = 1 - new_item_arr[e.currentTarget.dataset.id]
    this.setData({
      "page_display.item_display_arr": new_item_arr
    })
  }
})