var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var routes = require('./routes/index');
var routes = require('./routes/login_after');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));//设置的是模板文件默认存储在views文件夹下，
app.set('view engine', 'ejs');





// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//connect内建的中间件，设置根目录下的public文件夹下存放image，css，js 等静态文件的记录，也就说，public为静态文件的目录，即当项目启动访问的时候是没有public路径的
global.storeMemory = new session.MemoryStore();
app.use(session({
	secret:"webQQ",//这个是必须设定的，session和cookie值的加密和秘钥的
	key:"appSession",//默认是connect.sid
	cookie:{path:"/",httpOnly:true},//path:cookie 在哪个路径有效，httpOnly：cookie无法使用document.cookie查看，maxage：过期时间，毫秒为单位
	store:global.storeMemory//指定一个储存的对象，那那么session会储存子啊这里的，我们在这里定义的session中间件事不会去处理websocket之间的链接，所以在websocket要获取用户登录的数据，需要手动进行处理。那么我们要去的session的话，我们要在外部也能访问的到。那么我们使用的定义一个个去全局global去存储数据，所以，数据在任何位置都能被访问
}));

//app.use('/', routes);
//app.use('/users', users);
app.use('/login_after',routes);
/*这是自己测试的部分*/
//app.get("/user",require('./routes/dao.js').getUser);
//app.get("/add",require('./routes/dao.js').adduser);
/*app.get()和app.post()是express封装的http请求，主要使用使用get和post。他们的第一个参数为请求的路径，
 * 第二个参数为处理请求的回调函数，回调函数的两个参数分别为req和res分别为请求信息和响应信息请求*/
/*注册部分*/
app.get('/index',require('./routes/web_index').showView);
app.get('/regist',require('./routes/register').showView);
app.get('/checkUserName',require('./routes/register').checkUserName);
app.post('/postregist',require('./routes/register').postRegist);

/*登录部分*/

app.get('/login',require('./routes/login').showView);
//app.get('/login_after',require('./routes/login_after').showView);
app.post('/postlogin',require('./routes/login').postLogin);
app.get('/logout',function(req,res){
	delete(req.session.user);
	res.redirect('/index');
});

app.get('/groups',require('./routes/friend').getGroups);
app.get('/friends',require('./routes/friend').getFriendList);
app.post('/searchFriends',require('./routes/friend').searchFriends);
app.post('/addFriend',require('./routes/friend').addFriend);

//好友的添加
app.use('/getUserInfoById',require('./routes/friend').getInfoById);
app.post('/confirmFriend',require('./routes/friend').confirmFriend);




app.post('/editInfo',require("./routes/users").editInfo);

app.post('/mine',require("./routes/users").getMine);


//app.get('/login_after',require('./routes/login_after').showView);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
//开发环境下的错误信息，输出错误信息
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;




