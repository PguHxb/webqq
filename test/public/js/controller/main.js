var app = angular.module("webqq",[]);
app.directive('myContextmenu',function($parse){
	return {
		link:function(scope,element,attrs){
			element.on('contextmenu',function(event){
				var fn=$parse(attrs.myContextmenu);
				fn(scope,{event:event});
			});	
		}
	}
});

//这里是转换时间戳，将事件转换为数字类型的事件戳，好进行比较
app.filter("jdate",function(){
		return function(input){
			var out ="";
			try{
				var date = new Date(parseInt(input,10));
				out = date;
			} catch(e){
				
			}
			return out;
		}
});

//这是将对所有未读消息的总计
app.filter("newmessagecount",function(){
	return function(input){
		var count = 0;
		for(var i in input){
			count+=input[i].length;
		}
		return count;
	}
});


//这是的到日期时间
app.filter("getDate",function(){
	return function(input){
		var out = "";
		try{
			out = inout.getDate();
			
		} catch(e){
			
		}
		return out;
	}
})


app.controller("main",["$scope","$http","$filter",function($scope,$http,$filter){
	$(document).bind('click',function(){
		$('#groupdropdown,#addgroupdropdown').hide();
	});
	//这是在window对象下，定义的函数，而所做的事就是向下传播事件，就是当窗口要关闭之前所做的事
	window.onbeforeunload=function(){
		$scope.$broadcast("unload");
	}
	$scope.friendRequests=[];//这里控制的是消息闪烁，就是存放传过来的验证消息
	$scope.infoCache={};//缓存数据，将验证消息缓存
	$scope.updateMine=function(){
		$http.post('/mine').success(function(data){
			$scope.mine=data.result;
		});
	};
	$scope.updateMine();//进来的时候调用自身，是为了自动刷新
	
	$scope.showAddFriendDialog=function(){
		$scope.$broadcast("showAddFriendDialog");
		/*为什么要函数调用的方式来实现事件的点击呢，目的就是为了团队的分工与合作，因为后期的做项目的时候，每个人都有自己的模块功能要做，所以自己的功能模块自己要做好 */
	};
	$scope.showEditInfoDialog=function(){
		$scope.$broadcast("showEditInfoDialog");
	};
	//打开好友添加请求的事件
	$scope.showConfirmFriendDialog=function(){ 
		$scope.$broadcast('showConfirmFriendDialog');
	};
	//这是为了防止在www.js中，就是防止每一条请求的都进入，导致其重复的操作
	var socket = io.connect("/connect");
	$scope.socket=socket;
	//在friend.js中有触发
	socket.on("friendRequest",function(data){
		/*$scope.friendRequest=data;//在main下是有了这个friendrequest，angular好传数据
		$scope.$apply();
		alert(data.username+"请求添加你为好友，验证消息是:"+data.message);*/
		$scope.friendRequests.push(data);//将数组存进去
		$scope.$apply();//传播modal的变化，自动更新数据
	});
	
	socket.on('addFriend',function(data){
		$scope.friends.push(data);
		$scope.$apply();
		
	});
	
	socket.on("say",function(data){
		$scope.$broadcast("reciveMessage",data);
		$scope.$apply();
	});
	//这是如果有登录的时候，将推出到主界面
	socket.on("nologin",function(data){
		location.href="/index";
	})
	
	
	/*这是处理对面添加自己为好友时获得他的信息。
	 * 
	 * 那么是如何获取信息的呢，当对面第一次发送好友请求的时候，因为自己是没有缓存到对面的信息的，
	 * 所以就会去调用方法(friend.js中的getInfoById())去查询对面的信息。
	 * 
	 * 那么缓存是干什么的呢，就是当对面多次添加我为好友的时候，因为我是有将他的信息缓存的，所以第二次是直接从缓存中读取数据的。
	 * 当然，第一次还是要调用方法去查询的。
	 * 第二的缓存是从第一次查询时获得的id,如下：
	 * $scope.infoCache[id]=data.result[0];
	 * */
	$scope.getInfoById=function(id,callback){
		if($scope.infoCache[id]){
			callback(undefined,$scope.infoCache[id]);//如果缓存中有数据，那么就直接调用回调函数，那么就直接将这笔数据直接显示在显示在界面上
			//这是如果缓存中没有数据，就使用方法去数据库获取数据
		}else{
			//如果没有异步获取，那么就加入缓存后回调
			$http.post('/getUserInfoById',{id:id},'json').success(function(data){
				if(data.success&&data.result.length>0){
					$scope.infoCache[id]=data.result[0];//将从数据库中查询到的的数据赋值给$scope.infoCache[id]
					callback(undefined,$scope.infoCache[id]);
					
				}else{
					callback({message:'没有对应的用户数据'},undefined);
					
				}
			})
		}
	}
	
	$scope.removegroup=function(){
		alert("remove"+$scope.selectGroup.id);
		console.log($scope.selectGroup.id);
		
	}
	$scope.editgroup=function(){
		alert("edit"+$scope.selectGroup.id);
	}
	$scope.addgroup=function(){
		alert("addgroup");
	}
	$scope.openChat=function(id){
		
		$scope.$broadcast('openChat',{id:id});
		
	}
	
	
	
}]);