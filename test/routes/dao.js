/*这是封装一个数据库连接*/
var mysql=require('mysql');
module.exports={
		query:function(sql,paramArr,callback){
			//适应 xxx.query(sql,function(){});
			//xxx.query(sql,[],function(){});
			if(typeof(paramArr)=="function"){
				//参数修正
				callback=paramArr;
				paramArr=undefined;
			}
			//第一：创建连接
			var conn=mysql.createConnection({
				host:'localhost',//127.0.0.1
				port:3306,
				user:'root',
				password:'0321',
				database:'hxb'
			});
			//第二：打开连接
			conn.connect(function(err){
				if(err){
					console.log(err.message);
					throw err;
				}
			});
			//第三：执行查询语句
		
			if(paramArr==undefined){
				conn.query(sql,function(err,rows,fields){
					//执行用户定义的回调函数
					callback(err,rows,fields);
					//第四：关闭连接
					conn.end(function(err){
						if(err){
							console.log(err.message);
						}
					});
				})
			}else{
				conn.query(sql,paramArr,function(err,rows,fields){
					//执行用户定义的回调函数
					callback(err,rows,fields);
					//第四：关闭连接
					conn.end(function(err){
						if(err){
							console.log(err.message);
						}
					});
				})
			}
		},
		//这是实现数据库事务处理而写的数据库操作
		getConnection:function(callback){
			var conn=mysql.createConnection({
				host:'localhost',//127.0.0.1
				port:3306,
				user:'root',
				password:'0321',
				database:'hxb'
			});
			//第二为打开连接
			conn.connect(function(err){
				//进行判错
				if(err){
					console.log(err.message);
					throw err;
				}
				callback(conn);
			});
		}
		
		
}