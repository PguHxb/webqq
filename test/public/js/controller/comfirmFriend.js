app.controller('confirmFriend',["$scope","$http",function($scope,$http){
	$scope.$on('showConfirmFriendDialog',function(){
		/*pop() 方法将删除 数组对象的最后一个元素，把数组长度减 1，并且返回它删除的元素的值。
		 * 如果数组已经为空，则 pop() 不改变数组，并返回 undefined 值。
		 * 这里是将friendRequest中获得的数组对象删除*/
		$scope.confirmInfo=$scope.friendRequests.pop();
		if($scope.confirmInfo){
			$scope.getInfoById($scope.confirmInfo.from,function(err,userinfo){
				//这里应该是没有错误所执行的
				if(!err){
					//将pass自动设置为true，添加好有选择栏出现
					$scope.pass='true';
					$scope.group=$scope.groups[0];//取得当前的分组情况
					$scope.remark="";
					$('#confirmfriend').modal('show');
				}
			});
		}
	});
	//当成功添加的时候，就将模态框隐藏，并将数据提交
	$scope.confirmResult=function(){
		$http.post('/confirmFriend',{id:$scope.confirmInfo.id,pass:$scope.pass,remark:$scope.remark,groupid:$scope.group.id}).success(function(data){
			$('#confirmfriend').modal('hide');
		});
	};
}]);