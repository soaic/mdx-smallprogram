const AV = require('../libs/av-weapp-min.js');
const tableName = 'Audio'
const OFFICAL_SHARE = "1"
const USER_SHARE = "2"

//查询主页EQ
module.exports.requestMainEq = function requestMainEq(data) {
  if (!data) return
  AV.Query.doCloudQuery('select * from ' + tableName + ' where uid = "' + data.uid + '" or shareState = 1')
    .then(function (res) {
      var results = res.results;
      if (data.success) {
        data.success(results)
      }
    }, function (error) {
      // 异常处理
      console.error(error);
      if (data.fail) {
        data.fail(error)
      }
    });
}

//搜索
module.exports.searchEq = function searchEq(data){
  if (!data) return
  AV.Query.doCloudQuery('select * from ' + tableName + ' where name_zh_cn like "%' + data.searchText + '%" and shareState = ' +data.shareState)
    .then(function (res) {
      console.log(res)
      var results = res.results;
      if (data.success) {
        data.success(results)
      }
    }, function (error) {
      // 异常处理
      console.error(error);
      if (data.fail) {
        data.fail(error)
      }
    });
}

//查询用户分享
module.exports.queryUserShare = function queryUserShare(data){
  if(!data) return 
  AV.Query.doCloudQuery('select * from ' + tableName + ' where shareState = 2 order by ' + data.sort + ' desc')
    .then(function (res) {
      var results = res.results;
      if (data.success) {
        data.success(results)
      }
    }, function (error) {
      // 异常处理
      console.error(error);
      if (data.fail) {
        data.fail(error)
      }
    });
}

//查询官方分享
module.exports.queryOfficalShare = function queryOfficalShare(data, sort){
  if (!data) return 
  AV.Query.doCloudQuery('select * from ' + tableName + ' where shareState = 1 order by ' + data.sort + ' desc')
    .then(function (res) {
      var results = res.results;
      if (data.success) {
        data.success(results)
      }
    }, function (error) {
      // 异常处理
      console.error(error);
      if (data.fail) {
        data.fail(error)
      }
    }); 
}

//点赞
module.exports.nickEq = function nickEq(data){
  if(!data) return
  var audio = AV.Object.createWithoutData(tableName, data.id);
  audio.fetch().then(function (todo) {
    todo.increment('nicknum', 1);
    todo.fetchWhenSave(true);
    return todo.save();
  }).then(function (res) {
    // 使用了 fetchWhenSave 选项，save 成功之后即可得到最新的 views 值
    console.log(res)
    if (data.success) {
      data.success(res)
    }
  }, function (error) {
    // 异常处理
    console.error(error);
    if (data.fail) {
      data.fail(error)
    }
  });
}

//保存
module.exports.save = function save(data){
  if(!data) { return }
  const user = AV.User.current();
  var Audio = AV.Object.extend(tableName);
  var a = new Audio();
  a.set('name_zh_cn', data.content.name_zh_cn);
  a.set('icon', data.content.icon);
  a.set('nicknum', 0);
  a.set('position', data.content.position.toString());
  a.set('isOffical', 0);
  a.set('descript', data.content.descript);
  a.set('shareState', 0);//2为用户分享，1位官方分享, 0未分享
  a.set('peakingEQList', JSON.stringify(data.content.peakingEQList));
  a.set('uid', data.content.uid)
  a.set('uname', data.content.uname)
  a.set('uphoto', data.content.uphoto)
  a.save().then(function (a) {
    // 成功
    console.log('New object created with objectId: ' + a.id);
    if (data.success){
      data.success(a)
    }
  }, function (error) {
    // 异常
    console.error('Failed to create new object, with error message: ' + error.message);
    if (data.fail) {
      data.fail(error)
    }
  });
}

//删除
module.exports.del = function del(data){
  if (!data) { return }
  var todo = AV.Object.createWithoutData(tableName, data.id);
  todo.destroy().then(function (res) {
    // 删除成功
    if (data.success) {
      data.success(res)
    }
  }, function (error) {
    // 删除失败
    if (data.fail) {
      data.fail(error)
    }
  });
}

//修改
module.exports.update = function update(data){
  if (!data) { return }
  // 第一个参数是 className，第二个参数是 objectId
  var ad = AV.Object.createWithoutData(tableName, data.content.id);
  // 修改属性
  ad.set('name_zh_cn', data.content.name_zh_cn);
  ad.set('icon', data.content.icon);
  ad.set('descript', data.content.descript);
  ad.set('peakingEQList', JSON.stringify(data.content.peakingEQList));
  ad.set('uname', data.content.uname)
  ad.set('uphoto', data.content.uphoto)
  // 保存到云端
  ad.save().then(function (a) {
    // 成功
    if (data.success) {
      data.success(a)
    }
  }, function (error) {
    // 异常
    if (data.fail) {
      data.fail(error)
    }
  })
}

//分享
module.exports.share = function share(data){
  if (!data) { return }
  var ad = AV.Object.createWithoutData(tableName, data.id);
  // 修改属性
  ad.set('shareState', 2);
  // 保存到云端
  ad.save().then(function (res) {
    // 成功
    if (data.success) {
      data.success(res)
    }
  }, function (error) {
    // 异常
    if (data.fail) {
      data.fail(error)
    }
  })
}

module.exprots = {
}
