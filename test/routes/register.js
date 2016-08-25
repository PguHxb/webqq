/**
 * New node file
 */

module.exports={
		showView:function(req,res){
			res.render('register',{title:"欢迎您注册WebQQ"});
		},
		checkUserName:function(req,res){
			var username=req.query["username"];
			res.writeHead(200,{"Content-Type":"text/json;charset=utf-8"});
			var mysqlDao=require('./dao');
			mysqlDao.query('select count(*) as count from tb_user where username=?',[username],function(err,rows){
				if(err){
					res.end(JSON.stringify({success:false,message:err.message}));
				}else{
					if(rows[0].count>0)
						res.end(JSON.stringify({success:false}));
					else 
						res.end(JSON.stringify({success:true}));
				}
			});
			
		},
		postRegist:function(req,res){
			var username=req.body["username"];
			var password=req.body["password"];
			var errcount=0;
			if(!/^[a-zA-Z][a-zA-Z0-9_]{2,9}$/.test(username)) errcount++;
			if(!(password.length>5&&password.length<17)) errcount++;
			res.writeHead(200,{"Content-Type":"application/json;charset=utf-8"});
			if(errcount>0){
				res.end(JSON.stringify({success:false,message:'数据验证不正确'}));
			}
			var mysqlDao=require('./dao');
			mysqlDao.query('insert into `tb_user` (`username`,`password`) values(?,sha1(?))',[username,password],function(err,rows){
				if(err){
					res.end(JSON.stringify({success:false,message:'注册失败'}));
				}else{
					res.end(JSON.stringify({success:true,message:'注册成功'}));
				}
			});
		}
		
		
}