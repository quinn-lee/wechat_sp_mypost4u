// pages/auxiliary/valuation.js

const util_time = require('../../utils/time.js');
const util_interface = require('../../utils/interface.js'); 
const util_handle = require('../../utils/handle.js');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_display:{
      title_image_src: "../../resources/auxiliary/cal_price.png",
      pull_down_image_src: "../../resources/auxiliary/pull_down.png",
      question_image_src: "../../resources/auxiliary/question.png",
      split_image_src: "../../resources/auxiliary/split.png",
      sender_country_arr: ["德国","法国","英国"],
      sender_country_index: 0,
      sender_country_disabled: true,
      rcpt_country_arr: ["中国", "中国-香港"],
      rcpt_country_index: 0,
      rcpt_country_disabled: true,
      currency_arr: ["欧元","人民币","英镑"],
      currency_index: 0,
      page_currency: "EUR",
      page_to_currency: "CNY",
      weight_input_fouce: false,
      buy_link_hidden: true
    },
    exchange_rate:{
      date: util_time.dateFtt("yyyy-MM-dd", new Date()),
      rate: ""
    },
    products_type: ["奶粉专线(普通)", "奶粉专线(白金)", "奶粉专线(至尊)", "小包奶粉(普通)", "小包奶粉(白金)", "小包奶粉(至尊)", "杂货包税专线", "小包食品保健品", "DHL优先包", "DHL经济包"],
    products_remark: [],
    products_info:[
      { product_name: "奶粉专线(普通)", origin_price: "-", price: "-", tax_info: "包税", currency: "", remark: false },
      { product_name: "奶粉专线(白金)", origin_price: "-", price: "-", tax_info: "包税", currency: "", remark: false },
      { product_name: "奶粉专线(至尊)", origin_price: "-", price: "-", tax_info: "包税", currency: "", remark: false },
      { product_name: "小包奶粉(普通)", origin_price: "-", price: "-", tax_info: "包税", currency: "", remark: false },
      { product_name: "小包奶粉(白金)", origin_price: "-", price: "-", tax_info: "包税", currency: "", remark: false },
      { product_name: "小包奶粉(至尊)", origin_price: "-", price: "-", tax_info: "包税", currency: "", remark: false },
      { product_name: "杂货包税专线", origin_price: "-", price: "-", tax_info: "按商品计税", currency: "", remark: false },
      { product_name: "小包食品保健品", origin_price: "-", price: "-", tax_info: "按商品计税", currency: "", remark: false },    
      // { product_name: "E特快", origin_price: "-", price: "-", tax_info: "包税", currency: "", remark: false },
      // { product_name: "CZ-EMS", origin_price: "-", price: "-", tax_info: "海关抽检", currency: "", remark: false },
      { product_name: "DHL优先包", origin_price: "-", price: "-", tax_info: "海关抽检", currency: "", remark: false },
      { product_name: "DHL经济包", origin_price: "-", price: "-", tax_info: "海关抽检", currency: "", remark: false },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    console.log("into onShow")
    //汇率使用 缓存机制
    var today = util_time.dateFtt("yyyy-MM-dd", new Date());
    util_interface.getLastExchangeRate(app.globalData, this, today, this.data.page_display.page_currency, this.data.page_display.page_to_currency)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
   * 打开产品介绍页面
   */
  catchProductIntrTap: function(e){
    wx.navigateTo({
      url: 'product_intr',
    })
  },

  /**
   * 进入购买包裹界面
   */
  catchToBuyTap: function(e){
    console.log("into catchToBuyTap")
    //使得包裹界面进行接口调用
    if (app.globalData.page_on_hide==false) {
      app.globalData.page_on_hide = true
    }

    wx.navigateTo({
      url: '../parcels/index',
    })
  },

  /**
   * picker 普通选择器,数据变化事件
   */
  pickerChange: function(e){
    console.log(e)
    if(e.target.id == "sender_country_picker"){
      this.setData({
        "page_display.sender_country_index": e.detail.value
      })
    }
    else if (e.target.id == "rcpt_country_picker") {
      this.setData({
        "page_display.rcpt_country_index": e.detail.value
      })
    }
    else if (e.target.id == "currency_picker"){
      this.setData({
        "page_display.currency_index": e.detail.value
      })
    }
  },

  /**
   * 价格计算提交按钮
   */
  searchFormSubmit: function(e){
    console.log("into searchFormSubmit")
    console.log(e)
    if(e.detail.value.weight==""){
      util_handle.showFailToast("请输入重量", 1000)
      this.setData({
        "page_display.weight_input_fouce": true
      })
      return
    }
    util_interface.getValuation(app.globalData, this, e.detail.value)
  }
})