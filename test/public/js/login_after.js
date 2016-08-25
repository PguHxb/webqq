$(function() {
	$(".nav-footer ul li ").click(function(){
		 var index=$(this).index(); //获取被按下按钮的索引值，需要注意index是从0开始的
		$(".content> div").eq(index).show().siblings().hide(); //在按钮选中时在下面显示相应的内容，同时隐藏不需要的框架内容 
	 }); 
	$('body').on('click','.user-list li',function(){
		$('.user-list>li').removeClass('select');
		$(this).addClass('select');
	});
	$('body').on('click','.user-group-item>span',function(){
		
		$(this).parent().toggleClass('active');
	});
});