const util_time = require('time.js');

/**
 * 筛选按钮处理, 同一属性的只能单选
 */

function chooseBtn(btn_dis_array, i){
  var change_value = 1 - btn_dis_array[i]

  if (i >= 0 && i <= 2) {
    btn_dis_array.splice(0, 3, 0, 0, 0)
  }
  else if (i >= 3 && i <= 10) {
    btn_dis_array.splice(3, 8, 0, 0, 0, 0, 0, 0, 0, 0)
  }
  else if (i >= 11 && i <= 13) {  //支付状态
    btn_dis_array.splice(11, 3, 0, 0, 0)
  }
  else if (i >= 14 && i <= 16) {
    btn_dis_array.splice(14, 3, 0, 0, 0)
  }
  else if (i >= 17 && i <= 19) {
    btn_dis_array.splice(17, 3, 0, 0, 0)
  }

  btn_dis_array[i] = change_value
  console.log(btn_dis_array)
  return btn_dis_array
}

/**
 * 筛选界面,根据具体筛选条件 显示具体包裹
 */
function chooseParcel(parcel_h, condition){
  var is_hidden = false

  for (var j = 0, len = condition.length; j < len; j++) {
    //当前条件需要判断
    if (condition[j] == 1) {
      is_hidden = conditionParcel(parcel_h,j)
      //已需要隐藏,不判断后续条件
      if(is_hidden == true)
        break
    }
  }

  return is_hidden
}

/**
 * false 表明 符合要求,不隐藏
 * 默认返回 false
 */
function conditionParcel(parcel_h,i){
  if(i>=0 && i<=2){
    return timeCondition(parcel_h,i)
  }
  else if(i>=3 && i<=10){
    return productCondition(parcel_h,i)
  }
  else if(i>=11 && i<=13){  //支付状态
    return payStatusCondition(parcel_h,i)
  }
  else if(i>=14 && i<=16){
    return statusCondition(parcel_h, i)
  }
  else if(i>=17 && i<=19){
    return rcptCountryCondition(parcel_h, i)
  }

  return false;
}

/**
 * 各单独情况判断, 默认返回true
 */
function timeCondition(parcel_h,i){
  var s_date = parcel_h.createTime.substring(0,10)
  var e_date = util_time.dateFtt("yyyy-MM-dd", new Date())
  var diff_day = util_time.getDateDiff(e_date, s_date)
  //创建日期-三天内
  if (i == 0) {
    if(diff_day<3)
      return false
  }
  //创建日期-一周内
  else if (i == 1) {
    if (diff_day < 7)
      return false
  }
  //创建日期-一月内
  else if (i == 2) {
    if (diff_day < 31)
      return false
  }

  return true;
}

function productCondition(parcel_h,i){
  //物流产品-奶粉专线
  if (i == 3) {
    if (parcel_h.product == "奶粉专线" || parcel_h.product == "NFZX" || parcel_h.product == "小包奶粉专线")
      return false;
  }
  //物流产品-阳光包税/杂货
  else if (i == 4) {
    if (parcel_h.product == "阳光包税专线" || parcel_h.product == "杂货包税专线")
      return false;
  }
  //物流产品-DHL优先
  else if (i == 5) {
    if (parcel_h.product == "DHL")
      return false;
  }
  //物流产品-DHL经济
  else if (i == 6) {
    if (parcel_h.product == "DHL经济包")
      return false;
  }
  //物流产品-捷克邮政
  else if (i == 7) {
    if (parcel_h.product == "CZ-EMS")
      return false;
  }
  //物流产品-中德快件
  else if (i == 8) {
    if (parcel_h.product == "快益中德快件")
      return false;
  }
  else if (i == 9) {
    if (parcel_h.product == "小包奶粉专线")
      return false;
  }
  else if (i == 10) {
    if (parcel_h.product == "小包食品保健品专线")
      return false;
  }

  return true;
}

function payStatusCondition(parcel_h,i){
  //支付状态-支付成功
  if (i == 11) {
    if (parcel_h.payStatus == "已支付" || parcel_h.payStatus == "已补款")
      return false;
  }
  //支付状态-支付失败
  else if (i == 12) {
    if (parcel_h.payStatus == "支付中" || parcel_h.payStatus == "未支付")
      return false;
  }
  //支付状态-需要补款
  else if (i == 13) {
    if (parcel_h.payStatus == "需补款")
      return false;
  }

  return true;
}


function statusCondition(parcel_h, i) {
  //包裹状态-被拦截
  if (i == 14) {
    if (parcel_h.payStatus == "被拦截")
      return false;
  }
  //包裹状态-已取消
  else if (i == 15) {
    if (parcel_h.payStatus == "已取消") 
      return false;
  }
  //包裹状态-申请取消
  else if (i == 16) {
    if (parcel_h.payStatus == "申请取消")
      return false;
  }

  return true;
}



function rcptCountryCondition(parcel_h, i) {
  //国家-中国
  if (i == 17) {
    if (parcel_h.rcptCountry == "cn")
      return false;
  }
  //国家-德国
  else if (i == 18) {
    if (parcel_h.rcptCountry == "de")
      return false;
  }
  //国家-其他
  else if (i == 19) {
    if (parcel_h.rcptCountry != "cn" && parcel_h.rcptCountry!="de")
      return false;
  }

  return true;
}

module.exports = {
  chooseParcel: chooseParcel,
  chooseBtn: chooseBtn
}