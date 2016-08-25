app.controller('EditInfo',["$scope","$http",function($scope,$http){
	//angularJs的提交，只对IE10和现代浏览器可用
	$scope.modensave = function(){
		var fd = new FormData();
		var file = document.querySelector("input[type=file]").files[0];//取得input的file输入值
		fd.append('headshot',file);
		fd.append('nickname',$scope.coopymine.nickname);
		$http({//进行ajax提交
			methods:'post',
			url:"/editInfo",
			data:fd,
			headers:{"cont-type":undefined},
		}).success(function(response){
			alert(response.result);
			$scope.updateMine();
		});
	}
	//使用jquery.from插件，兼容IE
	
	$scope.save=function(){
		$("#form-editinfo").ajaxSubmit({
			url:"/editInfo",
			type:'post',
			dataType:"json",//返回的数据是json
			success:function(data){
				alert(data.result);
				$scope.updateMine();//调用函数实现数据的即时更新操作，
			}
		})
	};
	
	
	$scope.$on('showEditInfoDialog',function(event){
			$('#editinfo').modal("show");
			$scope.copymine = $.extend($scope.copymine,$scope.mine);//使用jquery的方法，复制一个个对象出来，从而避免元素框的改动影响了另一个数据
	});
	
	
}])



