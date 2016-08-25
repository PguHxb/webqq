var mysqlDao = require('./dao');//引入数据库模块
module.exports={
		getMine:function(req,res){
			var sql = "select * from tb_user where id=?";
			res.writeHead(200,{"content-type":"text/json;charset=utf-8"});
			mysqlDao.query(sql,[req.session.user.id],function(err,rows){
				if(err){
					res.end(JSON.stringify({
						success:false,
						result:err.message
					}));
				}else{
					res.end(JSON.stringify({
						success:true,
						result:rows[0]
					}));
				}
			});
		},
		
		editInfo:function(req,res){
			var formidable = require("formidable");//组件
			var form = new formidable.IncomingForm();
			form.upLoadDir = "../public/userhead";//配置上传路径
			form.keepExtensions =true;//保留扩展名，
			form.parse(req,function(err,fields,files){//处理完之后得到回调函数
				var mySqlDao = require("./dao");
				var sql,params;//根据不同的参数来做不同的操作
				
				res.writeHead(200,{"content-type":"text/json;charset=utf-8"});
				if(files.headshot){
					sql="update tb_user set nickname=?,headshot=? where id=?";
					params=[fields.nickname,files.headshot.path.replace("..\\public",""),req.session.user.id];
					
				}else{
					sql="updata tb_user set nickname=? where id=?";
					params=[filds.nickname,req.session.user.id];
				}
				
				mySqlDao.query(sql,params,function(err,rows){
					if(err){
						//先对错误进行判断，如果有错，则输出
						res.end(JSON.stringify({
							success:false,
							result:err.message
						}));
					}else{
						    res.end(JSON.stringify({
							success:true,
							result:"修改成功"
						}));
					}
				})
			})
		}
}