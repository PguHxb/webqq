#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('test:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

var io = require("socket.io")(server);

/*
 * 从握手协议中获得cookie，为握手信息对象设置session和cookie属性。
 * 
 * */
function getSessionAndCookie(handshakeData,callback){
	/*通过客户端的cookie字符串来获取其session数据*/
	var Cookies = {};//一个空的对象
	/*那么接下来就是解析传过来的握手协议中的headers部分，其中的cookie是浏览器访问的时候，获得的是一整串没有处理过得session信息*/
	if(handshakeData.headers.cookie){
		/*循环处理根据分号来切割多条的cookie信息然后处理，多条信息使用分号进行分开的，所以用分号进行切割多条信息进行处理*/
		handshakeData.headers.cookie.split(";").forEach(function(Cookie){
			/*根据等号来切割一条cookie的名称和值*/
			 var parts = Cookie.split('=');
			/*对上面定义的cookie对象赋值，值要使用UNescape()解码，不是一定要使用UNescape，
			 * 但大多数前端cookie操作插件都是将cookie值用escape()函数编码储存，
			 * parts[0]取到的是名称，parts[1]取到的值
			 * 取到的值是要进行unescape()函数进行解码*/
			 Cookies[parts[0].trim()] = unescape((parts[1] || '').trim());
			
		});
	}
	/*将cookie加入到握手数据对象中，之后可以使用socket.shakehand获取到握手数据对象
	 * */
	handshakeData.cookie = Cookies;
	/*接下来所做的就是取用户的session
	 * 获取seeion的标识名，nodejs保存的session令牌格式的类似
	 * s:0ge4hXDuObTYgKy0YTXShGgGPeSyYU7u.tLO+WRWal2lUhC0IxPT8kZJgwMPJDk1j8iqPyxNkNr4
	 * 0ge4hXDuObTYgKy0YTXShGgGPeSyYU7u   这个东西就是后台sessionStoreMemory存储对象中用户信息的属性名。
	 * 可以根据该属性名来获取到用户的session数据
	 * 
	 * 其中的app-session是在app.js中设置的中间件key。
	 * */
	//这段代码的就是取得有用的session，就是取得session中获取到的s:后面的和.号前面的
	
	if(handshakeData.cookie['appSession']){
	var connect_sid = handshakeData.cookie['appSession'].split('.')[0].split(':')[1];
	
	if(connect_sid){
		/*使用全局从sessionStoreMemory中获取用户的的session*/
		global.storeMemory.get(connect_sid,function(error,session){
			//先进行判错
			if(error){
				callback(error);
			}
			else{
				//将获取的用户session附加到握手对象中，如果后期的函数中有取到这个session，那么还是会有回调函数，但是，这时的回调函数就会是undefined
				handshakeData.session = session||{};
				callback(undefined);
			}
		});
	}
	else{
		callback({message:'nosession'});
	}
	}else{
		callback({message:'nosession'});
	}
}
/*创建一个内存，如果socket.handSocket.session.user这个，那证明他是登录的，那如果没有就触发浏览器端的事件*/
global.sessionSocket={};
/*如果这里直接定义的是on("connecttion")，也就是根下,那么每一条请求都会进入，那么定义一二命名空间，那么在前端的chat.html也还是要重新配置一下*/
io.of("/connect").on("connection",function(socket){
	/*后端收到链接之后，调用的函数，将handshake传入函数，其中函数如果没有找到session的haunted，那么就是会调用回调函数function是回调函数*/
	getSessionAndCookie(socket.handshake,function(err){
		/*如果这个错误不为undefined的话，我们执行下列事件，去触发浏览器端的事件*/
		if(err){
			socket.emit("nologin",err);
			/*没有出错就执行下列的代码，如果取到了user的话，就执行下列代码*/
		}else if(socket.handshake.session.user){
			/*这是成功获取用户的id,连上之后将用户的id设置成socketid，因为用户的id是唯一的
			 * 所以就算用户刷新页面用户的id也不会有变化，
			 * 所以后期我们就可以根据用户的id可以去到用户的端口*/
			global.sessionSocket[socket.handshake.session.user.id]=socket;
			socket.on("clientSay",function(data){
				/*data.form=socket.handshake.session.user.id;
				//定义一个clientSay事件，供浏览器调用 
				global.sessionSocket[data.to].emit("say",data);*/
				var from=socket.handshake.session.user.id;//这是获得当前登录用户的id
				var to=data.to;
				delete(data.to);
				data.time=new Date()-0;
		
				if(global.sessionSocket[to]){
					data.type=1;
					data.friend=from;
					global.sessionSocket[to].emit("say",data);
				}
				data.type=0;
				data.friend=to;
				socket.emit("say",data);
			});
			
			
			
			socket.on('disconnect',function(data){
				console.log("一个连接的关闭");
				/*当一个链接关闭 的时候，就可以将这个对象数据删除*/
				delete(global.sessionSocket[socket.handshake.session.user.id]);
				
			})
			socket.emit("showSocketId",{id:socket.handshake.session.user.id});//传出的是user的id
			
		}else{
			socket.emit("nologin",{message:"用户为登录！"});//这是没有获取用户id所触发的浏览器事件，并将自己定义的message丢出去
		}
	})
})





/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
