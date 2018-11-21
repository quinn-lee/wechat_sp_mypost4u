const util_handle = require('handle.js');
const util_time = require('time.js');

function getWebDomain(env){
  return env == "production" ? "https://www.europe-time.cn" : "https://www.world-paket.de";
}


//用户登入, 并获取用户 积分,签到 等信息
function userLogin(global_info, code, app, add_type){
  var show_flag=0
  wx.showLoading({
    title: "处理中",
    mask: true
  })
  show_flag+=1

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/login"
  console.log(url)

  wx.request({
    url: url,
    data: {
      code: code,
      type: global_info.id_type,
      additional: add_type
    },
    header: {
      'content-type': 'application/json',
      'content-env': global_info.env
    },
    dataType: "json",
    success: function (res) {
      if (res.data['status'] == 'succ') {
        if (res.data['msg'])
          console.log("登入提示:"+res.data['msg'])
        global_info.uid = res.data['uid']
        console.log('userLogin 登录成功:' + global_info.uid)

        if (add_type == "parcels") {
          console.log(res.data.add_info.parcels_data)
          console.log("total_page: "+ res.data.add_info.parcels_num)
          global_info.initParcels = res.data.add_info

          if (app.signInParcelsCallback) {
            app.signInParcelsCallback(res.data.add_info)
          }
        }
        else if(add_type=="payments"){
          console.log(res.data)
          global_info.initPayments = res.data.add_info

          if (app.signInPaymentsCallback) {
            app.signInPaymentsCallback(res.data.add_info)
          }
        }
      }
      else {
        // 会在前台显示处理中,客户无法进行其他操作
        if(res.data['msg'])
          util_handle.showModalSingleButtonAndExit('使用提示',res.data['msg'])
        else
          util_handle.showLoginFailToast()

        show_flag -= 1
      }
    },
    fail: function(res){
      console.log("userLogin request.fail:")
      console.log(res)
      util_handle.showLoginFailToast()
      show_flag -= 1
      console.log("fail end")
    },
    complete: function(res){
      if (show_flag>=1)
        wx.hideLoading()
    }
  })
}

/**
 * show登入
 */

function userLoginFromShow(global_info, code, page) {
  var show_flag = 0
  wx.showLoading({
    title: "处理中",
    mask: true
  })
  show_flag += 1
  console.log(global_info)
  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/login"
  console.log(url)

  wx.request({
    url: url,
    data: {
      code: code,
      type: global_info.id_type,
      additional: ''
    },
    header: {
      'content-type': 'application/json',
      'content-env': global_info.env
    },
    dataType: "json",
    success: function (res) {
      if (res.data['status'] == 'succ') {
        global_info.uid = res.data['uid']
        console.log('userLogin 登录成功:' + global_info.uid)

        if (page.data.simple_input_value != "") {
          getParcelList(global_info, page, page.data.simple_input_value, "", "", "", "", "simple")
        }
        else {
          getParcelList(global_info, page, page.data.search_display.input_rcpt, page.data.search_display.input_pnum, page.data.search_display.input_snum, page.data.search_display.start_date, page.data.search_display.end_date, "complex")
        }
      }
      else {
        if (res.data['msg'])
          util_handle.showModalSingleButtonAndExit('使用提示', res.data['msg'])
        else{
          util_handle.showLoginFailToast()
          show_flag -= 1
        }
      }
    },
    fail: function (res) {
      console.log("userLogin request.fail:")
      console.log(res)
      util_handle.showLoginFailToast()
      show_flag -= 1
      console.log("fail end")
    },
    complete: function (res) {
      if (show_flag >= 1)
        wx.hideLoading()
    }
  })
}

/**
 * download  后台统一提供一个地址进行下载
 *  根据type区分下载文件类型,id为要下载的唯一标志
 *  暂不适用
 */
function download(global_info, type, id){
  var show_flag=0
  wx.showLoading({
    title: "文件下载中",
    mask: true
  })
  show_flag += 1

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/download?type="+type+"&id="+id
  console.log(url)

  var download_path = wx.env.USER_DATA_PATH + "/" + id + ".pdf"
  wx.downloadFile({
    url: url,
    header: {
      'content-env': global_info.env,
      'content-uid': global_info.uid
    },
    dataType: "text",
    success: function (res) {
      console.log("download in success?")
      if (res.statusCode === 200) {
        console.log('下载成功:' + download_path)
        // var index = res.tempFilePath.lastIndexOf("\/"); 
        // var save_filepath = res.tempFilePath.substring(0,index)+"/"+id+".pdf"
        // console.log(res.tempFilePath+" <=====> " + save_filepath)
        var fsm = wx.getFileSystemManager()
        fsm.saveFile({
          tempFilePath: res.tempFilePath,
          filePath: download_path,
          success: function (res) {
            console.log('保存成功:' + res.savedFilePath)
            util_handle.showFailToast("下载成功,路径为\n" + res.savedFilePath, 5000)
            show_flag -= 1
          },
          fail: function(res){
            console.log(res)
          }
        })
      }
      else {
        util_handle.showFailToast("下载失败,请稍后重试", 2000)
        show_flag -= 1
      }
    },
    fail: function (res) {
      console.log("download request.fail:")
      console.log(res)
      util_handle.showFailToast("下载失败,请稍后重试", 2000)
      show_flag -= 1
    },
    complete: function (res) {
      if(show_flag>=1)
        wx.hideLoading()
    }
  })

}


/**
 * download  后台统一提供一个地址进行下载
 *  根据type区分下载文件类型,id为要下载的唯一标志
 */
function downloadOpen(global_info, type, id) {
  var show_flag=0
  wx.showLoading({
    title: "文件下载中",
    mask: true
  })
  show_flag += 1

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/download?type=" + type + "&id=" + id
  console.log(url)

  wx.downloadFile({
    url: url,
    header: {
      'content-env': global_info.env,
      'content-uid': global_info.uid
    },
    dataType: "text",
    success: function (res) {
      console.log("download in success?")
      console.log(res)
      if (res.statusCode === 200) {
        console.log('下载成功:' + res.tempFilePath)
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开成功')
          },
          fail: function(res){
            console.log('打开失败')
            console.log(res)
          }
        })
      }
      else {
        util_handle.showFailToast("下载失败,请稍后重试", 2000)
        show_flag -= 1
      }
    },
    fail: function (res) {
      console.log("download request.fail:")
      console.log(res)
      util_handle.showFailToast("下载失败,请稍后重试", 2000)
      show_flag -= 1
    },
    complete: function(res){
      if (show_flag>=1)
        wx.hideLoading()
    }
  })
}

/**
 * 查询接口
 */
function getParcelList(global_info, page, rcpt, pnum, snum, stime, etime, search_type) {
  var show_flag =0
  wx.showLoading({
    title: "检索中",
    mask: true
  })
  show_flag += 1

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/parcel_list"
  console.log(url)

  var r_page = 1
  if (search_type == "onReachBottom") {
    r_page = page.data.current_page + 1
  }
  console.log("page_num: " + r_page)

  wx.request({
    url: url,
    method: "POST",
    data: {
      rcpt: rcpt,
      parcel_num: pnum,
      shpmt_num: snum,
      start_time: stime,
      end_time: etime,
      page: r_page
    },
    header: {
      'content-type': 'application/json',
      'content-env': global_info.env,
      'content-uid': global_info.uid
    },
    dataType: "json",
    success: function (res) {
      if (res.data['status'] == 'succ') {
        console.log(res.data.add_info.parcels_data)
        console.log(res.data.add_info.parcels_num)
        //下拉获取新数据 -- 合并数据
        if (search_type =="onReachBottom"){
          //将原有数据都修改为非隐藏
          var parcels_data = page.data.parcels_data
          for (var j = 0, len = parcels_data.length; j < len; j++) {
            parcels_data[j].isHidden = false
          }
          
          page.setData({
            parcels_data: parcels_data.concat(res.data.add_info.parcels_data),
            parcels_num: res.data.add_info.parcels_num,
            "sm_display.btn_disabled": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            current_page: r_page,
          })
        }
        else{
          //筛选界面全部重置
          page.setData({
            parcels_data: res.data.add_info.parcels_data,
            parcels_num: res.data.add_info.parcels_num,
            "sm_display.btn_disabled": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            current_page: 1
          })

          //清空其他的查询列表
          if (search_type=="complex"){
            page.setData({
              "hidden_flag.search": true,
              "page_display.input_width": "",
              "simple_input_value": "",
              "search_display.input_pnum": pnum,
              "search_display.input_snum": snum,
              "search_display.input_rcpt": rcpt,
              "search_display.start_date": stime,
              "search_display.end_date": etime,
            })
          }
          else{
            page.setData({
              "search_display.input_pnum": "",
              "search_display.input_snum": "",
              "search_display.input_rcpt": "",
              "search_display.start_date": "",
              "search_display.end_date": "",
              "simple_input_value": rcpt
            })
          }
        }
      }
      else {
        util_handle.showFailToast("查询失败,请稍后重试", 2000)
        show_flag -= 1
      }
    },
    fail: function (res) {
      console.log("getParcelList request.fail:")
      console.log(res)
      util_handle.showFailToast("查询失败,请稍后重试", 2000)
      show_flag -= 1
    },
    complete: function(res){
      if (show_flag >= 1)
      wx.hideLoading()
    }
  })
}


/**
 * 关注接口
 */
function followParcel(global_info, page, pnum, is_follow, index_id) {
  var show_flag = 0
  wx.showLoading({
    title: "处理中",
    mask: true
  })
  show_flag += 1

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/parcel_follow"
  console.log(url)

  wx.request({
    url: url,
    method: "POST",
    data: {
      parcel_num: pnum,
      is_follow: !is_follow
    },
    header: {
      'content-type': 'application/json',
      'content-env': global_info.env,
      'content-uid': global_info.uid
    },
    dataType: "json",
    success: function (res) {
      if (res.data['status'] == 'succ') {
        var var_name = "parcels_data[" + index_id + "].isFollow"
        page.setData({
          [var_name]: !is_follow
        })
      }
      else {
        util_handle.showFailToast("操作失败,请稍后重试", 2000)
        show_flag -= 1
      }
    },
    fail: function (res) {
      console.log("getParcelList request.fail:")
      console.log(res)
      util_handle.showFailToast("操作失败,请稍后重试", 2000)
      show_flag -= 1
    },
    complete: function (res) {
      if(show_flag>=1)
        wx.hideLoading()
    }
  })
}

/**
 * 包裹详细信息接口
 */
function parcelInfo(global_info, page){
  if (page.data.api_call[0] == true) {
    console.log("正在获取中 稍后再试")
    return
  }

  var show_flag = 0
  wx.showLoading({
    title: "获取包裹信息",
    mask: true
  })
  show_flag += 1

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/parcel_info/" + page.data.parcel_info.parcelNum
  console.log(url)

  wx.request({
    url: url,
    data: {},
    header: {
      'content-type': 'application/json',
      'content-env': global_info.env,
      'content-uid': global_info.uid
    },
    dataType: "json",
    success: function (res) {
      if (res.data['status'] == 'succ') {
        var item_arr = new Array(res.data.add_info.item_info.count);
        if (item_arr.length>3)
          item_arr.fill(0);
        else
          item_arr.fill(1);

        page.setData({
          parcel_info: res.data.add_info,
          "page_display.item_display_arr": item_arr
        })

        console.log(page.data.page_display.item_display_arr)
      }
      else {
        util_handle.showFailToast("获取包裹信息失败", 1000)
        console.log("getParcelInfo 获取返回fail:")
        console.log(res)
        show_flag -= 1
        wx.navigateBack({
          delta: -1
        })
      }
    },
    fail: function (res) {
      console.log("getParcelInfo request.fail:")
      console.log(res)
      util_handle.showFailToast("获取包裹信息失败", 1000)
      show_flag -= 1
      wx.navigateBack({
        delta: -1
      })
    },
    complete: function (res) {
      if (show_flag >= 1)
        wx.hideLoading()

      page.setData({
        "api_call[0]": false
      })
    }
  })
}


/**
 * 包裹物流信息接口
 */
function parcelTrackingInfo(global_info, page) {
  if (page.data.api_call[1] == true) {
    console.log("正在获取中 稍后再试")
    return
  }

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/parcel_tracking_info/" + page.data.parcel_info.parcelNum
  console.log(url)

  wx.request({
    url: url,
    data: {},
    header: {
      'content-type': 'application/json',
      'content-env': global_info.env,
      'content-uid': global_info.uid
    },
    dataType: "json",
    success: function (res) {
      if (res.data['status'] == 'succ') {
        console.log("get tracking_info succ:" + res.data.add_info.tracking_info.length)
        // 显示的虚线长度
        var dotted_line_length = page.data.page_display.tracking_dotted_line_length
        for (var j = 0, len = res.data.add_info.tracking_info.length; j < len; j++) {
          // 物流信息描述字段长度 除以 定义的每2行显示字数 得出要显示多少行
          page.data.page_display.tracking_info_arr[j] = Math.ceil(util_time.getLength(res.data.add_info.tracking_info[j].info) / page.data.page_display.tracking_line)

          // 虚线长度
          dotted_line_length += page.data.page_display.tracking_info_arr[j] * page.data.page_display.tracking_height_unit
          console.log(util_time.getLength(res.data.add_info.tracking_info[j].info) + " --> " + page.data.page_display.tracking_info_arr[j] + " ; dotted:" + dotted_line_length)
        }

        page.setData({
          parcel_add_info: res.data.add_info,
          "page_display.tracking_info_arr": page.data.page_display.tracking_info_arr,
          "page_dislpay.tracking_dotted_line_length": dotted_line_length
        })

      }
      else {
        console.log("获取包裹物流信息失败:"+res.data.msg)
      }
    },
    fail: function (res) {
      console.log("getParcelTrackingInfo request.fail:")
      console.log(res)
    },
    complete: function (res) {
      page.setData({
        "api_call[0]": false
      })
    }
  })
}

/**
 * 获取最新的汇率
 */
function getLastExchangeRate(global_info, page, date, currency, to_currency="CNY") {
  console.log("getLastExchangeRate start")

  var show_flag = 0
  wx.showLoading({
    title: "处理中",
    mask: true
  })
  show_flag += 1

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/last_exchange_rate"
  console.log(url)

  wx.request({
    url: url,
    data: {
      currency: currency,
      to_currency: to_currency
    },
    header: {
      'content-type': 'application/json',
      'content-env': global_info.env,
      'content-uid': global_info.uid
    },
    dataType: "json",
    success: function (res) {
      if (res.data['status'] == 'succ') {
        page.setData({
          "exchange_rate.rate": res.data['rate']
        })
      }
      else {
        util_handle.showFailToast("汇率获取失败,请稍后重试", 2000)
        show_flag -= 1
      }
    },
    fail: function (res) {
      console.log("getLastExchangeRate request.fail:")
      console.log(res)
      util_handle.showFailToast("汇率获取失败,请稍后重试", 2000)
      show_flag -= 1
    },
    complete: function (res) {
      if (show_flag >= 1)
        wx.hideLoading()
    }
  })
}


/**
 * 获取计价结果
 */
function getValuation(global_info, page, form) {
  console.log("getValuation start")

  var show_flag = 0
  wx.showLoading({
    title: "计价中",
    mask: true
  })
  show_flag += 1

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/calc_price"
  console.log(url)

  wx.request({
    url: url,
    method: "POST",
    data: {
      product_type: page.data.products_type,
      sender_country: page.data.page_display.sender_country_arr[form.sender_country_index],
      rcpt_country: page.data.page_display.rcpt_country_arr[form.rcpt_country_index],
      length: form.length,
      width: form.width,
      height: form.height,
      weight: form.weight,
      currency: page.data.page_display.currency_arr[form.currency_index]
    },
    header: {
      'content-type': 'application/json',
      'content-env': global_info.env,
      'content-uid': global_info.uid
    },
    dataType: "json",
    success: function (res) {
      if (res.data['status'] == 'succ') {
        page.setData({
          products_info: res.data["price_arr"]
        })

        console.log(page.data.products_info)
      }
      else {
        util_handle.showFailToast("计价异常,请稍后重试", 2000)
        show_flag -= 1
      }
    },
    fail: function (res) {
      console.log("getValuation request.fail:")
      console.log(res)
      util_handle.showFailToast("计价异常,请稍后重试", 2000)
      show_flag -= 1
    },
    complete: function (res) {
      if (show_flag >= 1)
        wx.hideLoading()
    }
  })
}

/**
 * 查询支付列表
 */
function getPaymentList(global_info, page, form, search_type){
  console.log("getPaymentList start")
  
  var show_flag = 0
  wx.showLoading({
    title: "检索中",
    mask: true
  })
  show_flag += 1

  var r_page = 1
  var r_total_num = page.data.payments_data.total_num
  if (search_type == "onReachBottom") {
    // 下拉查询, 页数变化
    r_page = page.data.payments_data.current_page + 1
  }
  else {
    // 按钮查询,传入total_num为0,以进行 汇总值的计算
    r_total_num = 0
  }

  var url = getWebDomain(global_info.env)
  url += "/wechat/s_program/payment_list"
  console.log(url)

  console.log(form)
  wx.request({
    url: url,
    method: "POST",
    data: {
      tx_num: form.tx_num,
      pmnt_meth_desc: form.pmnt_meth, 
      pmnt_type_desc: form.pmnt_type,
      paid_at_beg: form.start_date,
      paid_at_end: form.end_date,
      pnum: form.pnum,
      page: r_page,
      total_num: r_total_num
    },
    header: {
      'content-type': 'application/json',
      'content-env': global_info.env,
      'content-uid': global_info.uid
    },
    dataType: "json",
    success: function (res) {
      console.log(res)
      if (res.data['status'] == 'succ') {
        var payment_list = page.data.payments_data.list
        if (search_type == "onReachBottom") {
          payment_list = payment_list.concat(res.data.add_info.payment_list)
        }
        else{
          payment_list = res.data.add_info.payment_list
        }
        page.setData({
          "payments_data.list": payment_list,
          "payments_data.total_num": res.data.add_info.total_num,
          "payments_data.payments_num": res.data.add_info.payments_num,
          "payments_data.current_page": r_page
        })
        if (res.data.add_info.summary_hash.calc == true){
          page.setData({
            "payments_data.summary_hash": res.data.add_info.summary_hash,
          })
        }
      }
      else {
        util_handle.showFailToast("检索异常,请稍后重试", 2000)
        show_flag -= 1
      }
    },
    fail: function (res) {
      console.log("getValuation request.fail:")
      console.log(res)
      util_handle.showFailToast("检索异常,请稍后重试", 2000)
      show_flag -= 1
    },
    complete: function (res) {
      if (show_flag >= 1)
        wx.hideLoading()
    }
  })

}

module.exports = {
  userLogin: userLogin,
  download: download,
  downloadOpen: downloadOpen,
  getParcelList: getParcelList,
  followParcel: followParcel,
  userLoginFromShow: userLoginFromShow,
  parcelInfo: parcelInfo,
  parcelTrackingInfo: parcelTrackingInfo,
  getLastExchangeRate: getLastExchangeRate,
  getValuation: getValuation,
  getPaymentList: getPaymentList
}