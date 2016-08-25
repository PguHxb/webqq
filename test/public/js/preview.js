//下面两个函数用于实现全浏览器图片上传预览
function previewImage(file, pid,text) {
    if (pid == undefined) {
        pid = 'preview';
    }
    if(text==undefined){
        text='预览';
    }
    
    var maxWidth = $('#'+pid).width();
    var maxHeight = $('#'+pid).height();
    var filevalue = $(file).val();
    if (filevalue != '') {
        var lastIndex = filevalue.lastIndexOf('.');
        if (lastIndex < 0) {
            alert('请选择图片文件');
        } else {
            var ex = filevalue.substr(lastIndex);
            if (ex == '.jpg' || ex == '.bmp' || ex == '.png' || ex == '.gif') {
            } else {
                var obj = file;
                obj.outerHTML = obj.outerHTML;
                $('#' + pid).html(text);
                alert('请选择图片文件');
                return;
            }
        }
    }
    var div = document.getElementById(pid);
    if (file.files && file.files[0]) {
        div.innerHTML = '<img id="imghead'+pid+'" />';
        var img = document.getElementById('imghead' + pid + '');
        img.onload = function () {
            var rect = clacImgZoomParam(maxWidth, maxHeight, img.offsetWidth, img.offsetHeight);
            img.width = rect.width;
            img.height = rect.height;
           // img.style.marginLeft = rect.left + 'px';
           // img.style.marginTop = rect.top + 'px';
        };
        var reader = new FileReader();
        reader.onload = function (evt) { img.src = evt.target.result; };
        reader.readAsDataURL(file.files[0]);
    }
    else {
        var sFilter = 'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="';
        file.select();
        try {
            window.parent.focus();
        } catch (e) {
        }
        var src = document.selection.createRange().text.replace(/\\/g, '\\\\');
        div.innerHTML = '<img id="imghead' + pid + '" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\')">';
        setTimeout(function () {
            var img = document.getElementById('imghead' + pid + '');
            var rect = clacImgZoomParam(maxWidth, maxHeight, img.offsetWidth, img.offsetHeight);
            status = ('rect:' + rect.top + ',' + rect.left + ',' + rect.width + ',' + rect.height);
          //  div.innerHTML = "<div id='divhead' style='width:" + rect.width + "px;height:" + rect.height + "px;margin-top:" + rect.top + "px;margin-left:" + rect.left + "px;" + sFilter + src + "\"'></div>";
            div.innerHTML = "<div id='divhead' style='  vertical-align: middle;display:inline-block;width:" + rect.width + "px;height:" + rect.height + "px;" + sFilter + src + "\"'></div>";
            
        },1);//稍微延迟，立即设置可能导致滤镜图片宽度计算失败


    }
}
function clacImgZoomParam(maxWidth, maxHeight, width, height) {
    var param = { top: 0, left: 0, width: width, height: height };
    if (width > maxWidth || height > maxHeight) {
        rateWidth = width / maxWidth;
        rateHeight = height / maxHeight;

        if (rateWidth > rateHeight) {
            param.width = maxWidth;
            param.height = Math.round(height / rateWidth);
        } else {
            param.width = Math.round(width / rateHeight);
            param.height = maxHeight;
        }
    }

    param.left = Math.round((maxWidth - param.width) / 2);
    param.top = Math.round((maxHeight - param.height) / 2);
    return param;
}