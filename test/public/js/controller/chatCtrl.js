app.controller('chatCtrl',function($scope, $http, $filter){
	$scope.$parent.newMessagesCache = {};//未读消息的缓存
	$scope.$parent.localMemeryHistroyCache = {};//聊天记录的历史，但是这些缓存是存在浏览器中的
	$scope.$parent.chatList = [];//管理的是会话列表，用于前台会话列表的展示，其中数据格式为{t:最后的时间，m:最后一天的信息内容，i:好友的id}
	$scope.chatPanels = [];/*聊天窗口的数组，其中的项数据格式
	{id:好友的id, showingMessages:当前展示的聊天记录，skip：当期展示跳过多少条历史记录，hr在那条记录后面插入 以上是历史记录的分割线}*/
	
	//这定义的是发送消息时使用的快捷键，其中panel为聊天窗口
	$scope.checkKey = function($event, panel){
		if(($event.ctrlkey||$event.altkey)&& $event.keyCode == 13){
			//其中的13应该是enter建所对应的码
			$scope.chatManager.say(panel);
		}
	}
	
	
	//接下来所写的就是聊天管理对象
	
	$scope.chatManager = {
			/*这是对加载历史记录的条数
			 * 每条记录的条数为10
			 * */
			pageSize :10,
			/*获取本地的历史记录的缓存
			 * 优先从内存中取数据，如果内存中没有则从浏览器的localStorage中取，如果还没有则返回一个空的数组
			 * */
			
			getLocalMemeryHistroy: function(id){
				if($scope.localMemeryHistroyCache[id] == undefined){
					if(localStorage[$scope.mine.id + '_' + id]){
						$scope.localMemeryHistroyCache[id] = JSON.parse(localStorage[$scope.mine.id + "_" + id]);
					}else{
						$scope.localMemeryHistroyCache[id] = [];
					}
				}
				return $scope.localMemeryHistroyCache[id];
			},
			
			/*根据好友的id获得新的消息列表
			 * 
			 * */
			getNewMessage:function(id){
				if($scope.newMessagesCache[id] == undefined){
					$scope.newMessagesCache[id] = [];
				}
				return $scope.newMessagesCache[id];
			},
			/*这是会话列表中的信息列表
			 * friendid 是好友的编号
			 * message  最好的一条信息内容
			 * time   时间戳
			 * 
			 * 当好友发送信息过来的时候，会进来这里，这里传入的是好友id，发送的信息和时间戳，即发送过来的时间
			 * 
			 *
			 * */
			
			updateCahtList:function(friendid,message,time ){
				//这是根据好友id来查找会话列表，找到会话对象后更新，没有找到则加入一个会话项
				
				var filterResult = $filter("filter")($scope.chatList,{
					i:friendid
				},true);//调用angular过滤器的filter方法来查找数组中所匹配的
				if(filterResult.length > 0){
					filterResult[0].m = message;
					filterResult[0].t = time;
				}else{
					$scope.chatList.push({
						t:time,
						m:message,
						i:friendid
					});
				}
			},
			
			/*根据索引值来删除聊天面板
			 * */
			deletePanel:function(index){
				
				$scope.chatPanels.splice(index,1);//splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目，每次删除数组索引值一项
				//如果聊天窗口的数组有一个或多个
				if($scope.chatPanels.length > 0){
					$scope.nowChatPanel = $scope.chatPanels[0];
				}else{
					$scope.nowChatPanel = undefined;
				}
			},
			/*打开聊天窗口
			 * friendid		这是好友好好友id
			 * noNeedLoad  需要加载历史数据，不需要时可以指定为true，未指定时是会在新打开的聊天框中加载历史数据的
			 * */
			
			openChat:function(friendid,noNeedLoad){
				//首先是从浏览器中获取该好友的所有的历史记录
			
				var histroies = $scope.chatManager.getLocalMemeryHistroy(friendid);
				var filterResult = $filter("filter")($scope.chatPanels,{
					id:friendid
				},true);//从聊天框数组中查找该好友的聊天框，没有找到的话在下面会做判断，创建一个。
				//首先将默认是不创建窗口的
				var created = false;
				var panel;
				//这里是如果没有好友列表窗口，则创建该好友窗口
				if(filterResult.length == 0){
					created = true ;
					//判断么有找到，创建一个新的聊天窗口，created 标志位true
					panel ={
						id:friendid,//好友的id
						skip:histroies.length,//取得好友的历史记录的长度
						showingMessage:[],
						hr:$filter("orderBy")(histroies,["s"])[histroies.lenght - 1]//这是一条分隔线，
					};
					$scope.chatPanels.push(panel);
					$scope.getInfoById(friendid,function(){});//调用main中的获取好友信息方法更新好友信息
				}else{
					panel = filterResult[0];
				}
				$scope.nowChatPanel = panel;//把当前的聊天面板指定的为这个panel
				var hasnew = $scope.chatManager.LoadNewMessageToHistory(panel);//将消息放入到该好友的聊天记录中
				if(!noNeedLoad&&created){
					//首次打开，加载历史记录，该函数自带RefreshShowingMessages
					$scope.chatManager.setSkip(panel);
				}else{
					$scope.chatManager.RefreshShowingMessages(panel);
				}
				
			},
			/*设置新的历史记录跳过的条数，根据分页数累减到0为止
			 * */
			setSkip:function(panel){
				//如果好友的历史长度减去加载的历史长度大于零
				if(panel.skip - $scope.chatManager.pageSize >=0){
					//那么显示的历史记录就为好友的历史长度减去加载的历史长度大于零
					panel.skip = panel.skip - $scope.chatManager.pageSize;
				}else{
				//将好友的新消息记录清空
					panel.skip = 0;
				}
				$scope.chatManager.RefreshShowingMessages(panel);
				//下面是处理加载历史记录后滚动条回到之前内容的位置
				if($('#chatbox_' + panel.id).scrollTop() + $('#chatbox_' + panel.id).height() != $('#chatbox_' + panel.id).find('.message-wrap').innerHeight()) {
					var oldScrollTop=$('#chatbox_' + panel.id).scrollTop();
					var oldInnerHeight=$('#chatbox_' + panel.id).find('.message-wrap').innerHeight();
					setTimeout(function() {
						var newInnerHeight=$('#chatbox_' + panel.id).find('.message-wrap').innerHeight();
						var diff=newInnerHeight-oldInnerHeight;
						$('#chatbox_' + panel.id).scrollTop(oldScrollTop+diff);
					}, 1)
				}
			},
			/*根据跳过条数，更新显示的消息列表
			 * */
			RefreshShowingMessages:function(panel){
				//这里取得是本地的历史记录的缓存，根据id取得
				var histroies = $scope.chatManager.getLocalMemeryHistroy(panel.id);
				panel.showingMessages = $filter('orderBy')(histroies, ['s']).slice(panel.skip);//根据时间戳排序然后slice返回指定元素
				$scope.chatManager.scrollToBottom(panel);
			},
			
			/**
			 * 将新消息放入历史记录
			 * 
			 */
			
			LoadNewMessageToHistory:function(panel){
				//这是获取的好友信息，其中的panelid是对方发送信息时所传送过来的id
				var newMessages = $scope.chatManager.getNewMessage(panel.id);
				//这里取得是本地的历史记录的缓存，根据id取得
				var histroies = $scope.chatManager.getLocalMemeryHistroy(panel.id);
				
				var hasnew = newMessages.length > 0 ;
				var popitem = newMessages.pop();
				while(popitem){
					histroies.push(popitem);
					popitem = newMessages.pop();
				}
				return hasnew;
			},
			
			/**
			 * 判断如果来消息的聊天框正好是当前聊天框，立即加载消息
			 *
			 */
			LoadNewMessageIfActive: function(friendid) {
				if($scope.nowChatPanel && $scope.nowChatPanel.id == friendid) {
					$scope.chatManager.LoadNewMessageToHistory($scope.nowChatPanel);
					$scope.chatManager.RefreshShowingMessages($scope.nowChatPanel);
				}
			},
			/**
			 * 如果当前滚动条位于底部，1ms后再次滚动到底部
			 * 
			 */
			scrollToBottom: function(panel, awaly) {
				//处理时使用setTimeout延迟1ms再设置滚动位置，要不内容还没生成，高度没变
				if(awaly) {
					setTimeout(function() {
						$('#chatbox_' + panel.id).scrollTop($('#chatbox_' + panel.id).find('.message-wrap').innerHeight())
					}, 1)
				} else if($('#chatbox_' + panel.id).scrollTop() + $('#chatbox_' + panel.id).height() >= $('#chatbox_' + panel.id).find('.message-wrap').innerHeight()) {
					setTimeout(function() {
						$('#chatbox_' + panel.id).scrollTop($('#chatbox_' + panel.id).find('.message-wrap').innerHeight())
					}, 1)
				}
			},
			/**
			 * 发送消息
			 *
			 */
			say: function(panel) {
				if(panel.message) {
					$scope.socket.emit('clientSay', {
						to: panel.id,
						message: panel.message
					});
					panel.message = '';
					$scope.chatManager.scrollToBottom(panel, true)
				}
			}
			
	};
	//这是打开聊天对话框，参数接受的是双击事件和对方传过来的聊天数据
	$scope.$on("openChat",function(event,data){
		
		$scope.chatManager.openChat(data.id);//调用openChat的方法
	});
	$scope.$on("reciveMessage",function(event,data){
		
		var friendNewMessagePool = $scope.chatManager.getNewMessage(data.friend);
		friendNewMessagePool.push({
			s: data.time,
			m: data.message,
			t: data.type
		});
		$scope.getInfoById(data.friend, function() {});//调用main中的获取好友信息方法更新好友信息
		$scope.chatManager.updateCahtList(data.friend, data.message, data.time);
		$scope.chatManager.LoadNewMessageIfActive(data.friend);
	});
	
	/**
	 * 关闭窗口时，将历史记录重新下入浏览器存储中
	 */
	$scope.$on("unload",function(event,data){
		try{
			for(var i in $scope.$parent.localMemeryHistroyCache){
				localStorage[$scope.mine.id + '_' + i] = $filter('json')($scope.$parent.localMemeryHistroyCache[i]);
			}
		} catch(e){
			for(var i in localStorage){
				delete(localStorage[i]);
			}
		}
	});
	
	
});