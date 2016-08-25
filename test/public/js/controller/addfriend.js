app.controller('addfriend',function($scope,$http){
	//$http为angularJS实现ajax请求自带的一个对象，
	$scope.step=1;//设置的处置就为1
	$scope.keyword=null;//因为当kw为空的时候，他是不会传值的，所以我们应该赋一个空值
	$scope.kw="";
	
	$scope.$on('showAddFriendDialog',function(event){
		resetStatus();
		$('#serach_friend').modal('show');
	});
	
	$scope.search = function(){
		
		$http.post('/searchFriends',{kw:$scope.kw}).success(function(data){//angular中错误的回调函数为err.(function(){})
			$scope.items = data.result;//把data 取回ajax数据赋给items,查询的结果给他
		});
	};

	$scope.select=function(item){
		$scope.selectItem=item;//选择查询到的数据，并加上
	};
	
	$scope.setInfo=function(){
		$scope.step=2;
		$scope.group=$scope.groups[0];
		$scope.remark=undefined;
		$scope.message=undefined;
		
	};
	
	var resetStatus = function(){//不需要被外部调用，直接将其变为全局变量,对输入内容的重置
		$scope.selectItem=undefined;
		$scope.step=1;
		$scope.items=undefined;
		$scope.kw="";
	};
	
	$scope.send = function(){
		$http.post('/addFriend',{remark:$scope.remark,to:$scope.selectItem.id,groupid:$scope.group.id,message:$scope.message}).success(function(data){
			if(data.success){
				alert(data.message);
			}
			$("#serach_friend").modal('hide');
		});
	}
	
	
});