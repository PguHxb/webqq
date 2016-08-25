exports.page=function(req,res){
	res.render('file',{title:'test post file'})
	
};

var formidable = require("formidable");
function upload(request,reponse){
	var form =  new formidable.IncomingForm();//这是一个固定的写法
	form.uploadDir="../public";
	from.keepExtensions = true;//文件路径是否要保留扩展名
	from.parse(request,function(error,fields,files){//处理请求，字段信息，文件信息
		consloe.log("id:"+fields.name);
		console.log("name:"+fields.name);
		response.writeHead(200,{"content-type":"text/html;charset=utf-8"});
		response.write("id:"+fields.id+"<br />");
		response.write("name:"+fields.name);
		response.end();
	});
}
exports.post=upload;