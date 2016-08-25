  app.controller("userlist",["$scope",function($scope){
				$.get('/groups',{},function(data){
					if(data.sucess){
						
						$scope.$parent.$parent.groups=data.result;/*加入parent的原因是因为增大他的作用域，变为他父级作用域了，也就是main控制器的作用域，以便后期设值的时候，main控制器都可以获得值，后期添加分组的时候，利于取数据*/
						$scope.$apply();//的触发操作
						$.get('/friends',{},function(fdata){
							if(fdata.success){
								$scope.friends=fdata.result;
								$scope.$apply();
							}
						},'json')
					}
					
				},'json');
				
				$scope.dbclick=function(){
					$event.preventDefault();
					alert();
				}
				
				$scope.showGroupContextMenu=function(event,group){
					
					$scope.$parent.$parent.selectGroup=group;
					console.log(group);
					event.preventDefault();
					event.stopPropagation();
					$('#groupdropdown').show().offset({top:event.pageY,left:event.pageX});
					$('#addgroupdropdown').hide();
					
				}
				$scope.showAddGroupContextMenu=function(event){
					event.preventDefault();
					event.stopPropagation();
					$('#addgroupdropdown').show().offset({top:event.pageY,left:event.pageX});
					$('#groupdropdown').hide();
				}
				$scope.$on('editGroup',function(data){
					
					if(!$scope.editingGroup){
						if($scope.selectGroup){
							$scope.editingGroup=$scope.selectGroup;
						}
					}
				})
			}]);