module.exports={
		showView:function(req,res){
			res.render('login');//当调用这个函数的时候，调用ejs模板渲染引擎，来渲染这个ejs模板文件，生成静态页面并显示在浏览器
		},
		postLogin:function(req,res){
			var mysqlDao=require('./dao');
			var username=req.body["login-username"];
			var password=req.body["login-password"];
			mysqlDao.query('select * from tb_user where username=? and password=sha1(?)',
					[username,password],
					function(err,rows){
				if(err){
					res.end(JSON.stringify({success:false,message:err.message}));
				}else{
					if(rows.length>0){  
						req.session.user={id:rows[0].id,username:rows[0].username};
						res.end(JSON.stringify({success:true,message:'登录成功'}));
					}else{
						res.end(JSON.stringify({success:false,message:'用户名或密码不正确'}));
					}
				}
			})
		}
}