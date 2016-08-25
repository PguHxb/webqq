var mysqlDao = require('./dao');
module.exports={
		getFriendList:function(req,res){
			mysqlDao.query('select * from vw_friendship where userid=?',[req.session.user.id],
			function(err,rows){
				if(err){
					res.end(JSON.stringify({success:false,result:[],messege:err.message}));
				}else{
					res.end(JSON.stringify({success:true,result:rows}));
				}
			});
		},
		
		getGroups:function(req,res){
			mysqlDao.query('select * from tb_group where userid=?',[req.session.user.id],
					function(err,rows){
				if(err){
					res.end(JSON.stringify({sucess:false,result:[],message:err.message}));
				}else{
					res.end(JSON.stringify({sucess:true,result:rows}));
				}
					
					
			});
			
		},
		
		searchFriends:function(req,res){
			res.writeHead(200,{"content-type":"text/json;charset=utf-8"});
			var keyword = req.body.kw;
			mysqlDao.query('select * from tb_user where (username like ? or nickname like ?) and id<> ?' ,['%'+keyword+'%','%'+keyword+'%',req.session.user.id],function(err,rows){
				/*id<> ?和后面的参数req.session.user.id表示的是不能将自己取出来，
				 * (username like ? or nickname like ?)表示的是只要用户名和昵称名满足其中的一个，就将其取出 ？代表的是占位符
				 *'%'+keyword+'%'模糊查选，只要匹配到这个字就可以了
				 * */
				
				if(err){/*首先应该进行判断有没有错误*/
					res.end(JSON.stringify({success:false,result:[],message:err.message}));/*如果错误，则输出最后错误信息，后面没有输出了，这是最后的输出*/
				}else{
					for(var i in rows){
						//输出的信息中是不能包含密码字段的，所以我们应当删除查询出来的数据密码字段
						delete(rows["password"]);
					}
					res.end(JSON.stringify({success:true,result:rows}));
				}
			});
		},
		
		addFriend:function(req,res){
			//res.writeHead(200,{"content-type":"text/json;charset=utf-8"});
			var remark = req.body.remark;//用户的备注名称
			var groupid = req.body.groupid;//想要将用户添加到那个分组的id
			var message = req.body.message;//用户验证消息
			var to = req.body.to;//添加好友请求向谁发送
			var from = req.session.user.id;//添加好友是谁发起的,获得当前的用户id
			mysqlDao.query('insert into tb_addfriend values (?,?,?,?,?,?,?)',[null,from,to,groupid,remark,new Date(),message],function(err,rows){//将对应的传入就可以，值参数的传入要与前面的？占位符要匹配
				if(err){
					res.end(JSON.stringify({success:false,message:err.message}));
				}else{
					/*在全局中寻找到to的这个用户，要添加好友的socket*/
					var socket = global.sessionSocket[to];
					/*进行判断，如果取到了值，就代表取到了端口*/
					if(socket){
						//socket.emit("friendRequest",{message:message,username:req.session.user.username});
						/*触发浏览器之间的事件，会触动前端中angular中的通知机制，表示发送了一个命令,并且将数据data传过去，而命令为friendRequest，数据为一组对象
						 * 而前端接收拾这样写的，socket.on("friendRequest".function(data){})*/
						socket.emit("friendRequest",{
							message:req.body.message,
							from:from,//当前登录用用户的id，登录用户的id是会传输给添加好友对方的，并让其进行查询自己时所操作的id,也就是自己的信息
							/*这是获得
							 * 使用SELECT LAST_INSERT_ID() 获取生成的ID，
							 *，就是在将插入操作完成后的返回结果里就带有自动生成的ID，可用rows.insertId获取
							 *
							 *这里的id就是新增好友时成功之后会将数据插入自己的tb_addfriend表中，而id:rows.insertId是为了
							 *获得插入表中自动返回的id，并将数据传输过去。
							 *为什么要使用这张表的列id?
							 *因为是要处理对个请求的，因为而且用户是可以删除对方好友的请求的
							 *如果对方不想添加你为好友的时候，那么这笔预存在数据库里的请求是没有什么用的。
							 *还有就是当自己多次添加一个好友多次的时候，数据库是由记录的。
							 * */
							id:rows.insertId
						});
					}
					res.end(JSON.stringify({success:true,message:"好友请求已发送!!!"}));
				}
			});
			
		},
		//这是根据用户id来查询用户的信息，并且是增加好友请求的时候，添加好友的对方实行的方法，目的就是查询要添加自己为好友的人的信息。
		getInfoById:function(req,res){
			res.writeHead(200,{"Content-Type":"text/json;charset=utf-8"});
			var id=req.body.id||req.query.id;
			mysqlDao.query('select * from tb_user where id= ? ',[id],function(err,rows){
				if(err){
					res.end(JSON.stringify({success:false,result:[],message:err.message}));
				}else{
					for(var i in rows){
						//遍历删除查询出的数据的密码字段
						delete(rows["password"]);
					}
					res.end(JSON.stringify({success:true,result:rows}));
				}
			});
		},
		//处理对方添加自己为好友时的方法
		confirmFriend:function(req,res){
			
			var id=req.body.id;//添加好友时对面的id(就是添加自己为好友的人的id)
			var groupid=req.body.groupid;//自己好友分组的id
			var remark=req.body.remark;//备注
			var pass=req.body.pass;//就是当数据正确显示的时候，将ng-show，当有数据正确显示的时候是默认打开的
			res.writeHead(200,{"Content-Type":"text/json;charset=utf-8"});
			
			mysqlDao.getConnection(function(conn){
				//数据库的事务处理机制
				conn.beginTransaction(function(err){
					if(err){
						res.end(JSON.stringify({success:false,message:err.message}));
					}else{
						conn.query('select * from tb_addfriend where id=?',[id],function(err,rows){
							if(err){
								res.end(JSON.stringify({success:false,message:err.message}));
							}else{
								if(rows.length==1){
									if(pass=='true'){
										//两次的insert into 插入就是执行两次的添加好友，意思就是说，当对面添加为好友的时候，你同意了，并把它加入你的好友列表中，
										//对面也是会将你添加到自己的好友列表中，所以应该将你也加入对面的好友列表中.
										conn.query('insert into tb_friendship values(?,?,?,?,?)',
												[null,rows[0].from,rows[0].to,rows[0].group,rows[0].remark],
												function(err,result1){
											if(err){
												res.end(JSON.stringify({success:false,message:err.message}));
												conn.rollback();//回滚
											}else{
												conn.query('insert into tb_friendship values(?,?,?,?,?)',[null,rows[0].to,rows[0].from,groupid,remark],function(err,result2){
													if(err){
														res.end(JSON.stringify({success:false,message:err.message}));
														conn.rollback();
													}else{
														conn.commit();//数据的提交
														conn.query('select * from vw_friendship where id in ('+result1.insertId+','+result2.insertId+')',function(err,vwResult){
															for(var i in vwResult){
																var socket=global.sessionSocket[vwResult[i].userid];
																if(socket){
																	socket.emit("addFriend",vwResult[i]);
																}
															}
														})
														res.end(JSON.stringify({success:true,message:"处理完成"}));
														
													}
												})
											}
										})
									}else{
										conn.query('delete from tb_addfriend where id=?',[id],function(){
											res.end(JSON.stringify({success:true,message:"处理完成"}));
										})
									}
								}else{
									res.end(JSON.stringify({success:false,message:"没有找到对应的好友添加请求"}));
								}
							}
						})
					}
				})
			})
		}
		
	}