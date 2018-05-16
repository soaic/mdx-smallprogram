const AV = require('../../libs/av-weapp-min.js');
const tableName = 'Audio'

//搜索
export function searchEq(shareState,searchText,callback){
  AV.Query.doCloudQuery('select * from ' + tableName + ' where name like %' + searchText + '% and shareState = '+shareState)
    .then(function (data) {
      var results = data.results;
      if (callback && callback.success) {
        callback.success(data)
      }
    }, function (error) {
      // 异常处理
      console.error(error);
      if (callback && callback.fail) {
        callback.fail(error)
      }
    });
}

//查询用户分享
export function queryUserShare(callback){
  AV.Query.doCloudQuery('select * from ' + tableName + ' where shareState = 2')
    .then(function (data) {
      var results = data.results;
      if (callback && callback.success) {
        callback.success(data)
      }
    }, function (error) {
      // 异常处理
      console.error(error);
      if (callback && callback.fail) {
        callback.fail(error)
      }
    });
}

//查询官方分享
export function queryOfficialShare(){
  AV.Query.doCloudQuery('select * from ' + tableName + ' where shareState = 1')
    .then(function (data) {
      var results = data.results;
      if (callback && callback.success) {
        callback.success(data)
      }
    }, function (error) {
      // 异常处理
      console.error(error);
      if (callback && callback.fail) {
        callback.fail(error)
      }
    });
}

//点赞
export function nickEq(audio, callback){
  AV.Query.doCloudQuery('update '+ tableName +' set nicknum = nicknum + 1 where objectId='+audio.id)
    .then(function (data) {
      var results = data.results;
      if (callback && callback.success) {
        callback.success(data)
      }
    }, function (error) {
      // 异常处理
      console.error(error);
      if (callback && callback.fail) {
        callback.fail(error)
      }
    });
}

//分享
export function share(audio, callback){
  const user = AV.User.current();
  var Audio = AV.Object.extend(tableName);
  var a = new Audio();
  a.set('name', audio.name_zh_cn);
  a.set('icon', audio.icon);
  a.set('nicknum', '0');
  a.set('position', '0');
  a.set('descript', audio.descript);
  a.set('shareState', '2');//2为用户分享，1位官方分享
  a.set('eqJson', JSON.stringify(audio.peakingEQList));
  a.set('uid', user.objectId)
  a.save().then(function (a) {
    // 成功
    console.log('New object created with objectId: ' + a.id);
    if (callback && callback.success){
      callback.success(a)
    }
  }, function (error) {
    // 异常
    console.error('Failed to create new object, with error message: ' + error.message);
    if (callback && callback.fail) {
      callback.fail(error)
    }
  });
}