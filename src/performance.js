var startTime = +new Date();
var whiteScreenEndTime = startTime + 20;


function getCurrentStyle(element, style) {
    var style = '';
    if (element.currentStyle) {
        //IE上兼容
        style = div.currentStyle[style];
    } else {
        //火狐谷歌上兼容
        style = window.getComputedStyle(element, null)[style]
    }
    return style;
}


//判断是否隐藏
function isHidden(element) {
    //获取元素最终样式
    var display = getCurrentStyle(element, 'display');
    var visibility = getCurrentStyle(element, 'visibility');
    //获取元素宽高
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    //对于绝对隐藏、相对隐藏、宽高为0的元素可以认为是不需要在首屏展示的
    return display === 'none' ||
        visibility === 'hidden' ||
        width === 0 ||
        height === 0;
}
//判断是否在首屏
function isInFirstScreen(element) {
    //获取元素距离浏览器可视区域的相对距离
    var client = element.getBoundingClientRect();
    return client.left >= 0 &&
        client.left < (document.documentElement.clientWidth || document.body.clientWidth) &&
        client.top >= 0 &&
        client.top < (document.documentElement.clientHeight || document.body.clientHeight);
}
//判读是否为非缓存图片
function isCache(url) {
    //排除掉一些无法缓存的图片，比如验证码,不带src属性的占位图片等
    return !url || url.indexOf('?') !== -1;
}


var urlList = [];
//收集img标签中的图片url
function getTagImgList() {
    var imgList = document.getElementsByTagName('img');
    for (var i = 0; i < imgList.length; i++) {
        var img = imgList[i];
        var url = img.getAttribute('src');
        //判断是否隐藏、是否在首屏、是否为非缓存
        if (!isCache(url)) {
            urlList.push({ element: img, url: url });
        }
    }
}
//收集背景样式中的图片url
function getStyleImgList() {
    var styleList = document.getElementsByTagName('*');
    for (var i = 0, len = styleList.length; i < len; i++) {
        var element = styleList[i];
        //第一步判断是否隐藏及是否为图片，因为有判断专门为img的逻辑，这一步可以过滤掉大部分不相干的元素
        if (element.tagName !== 'IMG' && !isHidden(element)) {
            //取得元素的最终样式，避免获取覆盖的样式
            var background = getCurrentStyle(element, 'backgroundImage');
            //第二步判断是否设置了背景图片及是否在首屏
            if (background && background.indexOf('url') !== -1 && isInFirstScreen(element)) {
                //提取出纯净的url地址
                var url = background.split(/\(|\)/g)[1];
                //ie两边会把双引号给带上
                url = url.replace(/\"+/g, '');
                urlList.push({ element: element, url: url });
            }
        }
    }
}


//url去重处理
function getUniqueList() {
    var tempList = [];
    var temp = {};
    for (var i = 0, len = urlList.length; i < len; i++) {
        var url = urlList[i];
        if (!temp[url.url]) {
            temp[url.url] = true;
            tempList.push(url);
        }
    }
    urlList = tempList;
}



//绑定onload事件
function onload(img, element, callback) {
    //判读是否为IE
    var ie = !!(window.attachEvent && !window.opera);
    var done = false;
    var fn = function () {
        //有可能发生重复响应onload的情况，所以这个地方标识一下
        if (!done) {
            done = true;
            //清理一下内存
            img = img.onload = img.onerror = null;
            //图片加载完毕判断是否隐藏，及是否在首屏
            if (!isHidden(element) && isInFirstScreen(element)) {
                callback && callback();
            }
        }
    };
    //图片加载失败的情况也需要监听
    img.onload = img.onerror = function () {
        fn();
    };
    //有的ie浏览器在缓存存在的情况可能不会响应onload事件，所以需要定时监听readyState状态
    if (ie) {
        //设置一个定时器，不断判断readyState状态
        var timer = window.setInterval(function () {
            //如果已经执行过回调了，则无需在继续心跳
            if (done) {
                timer && window.clearInterval(timer);
                return;
            }
            //readyState为loaded或者comlete时代表加载完毕
            if (img.readyState === 'loaded' || img.readyState === 'complete') {
                timer && window.clearInterval(timer);
                fn();
            }
        }, 10);
    }
}
//给所有url创建Image对象，并绑定onload事件
function bindImgOnload() {
    for (var i = 0, len = urlList.length; i < len; i++) {
        var url = urlList[i];
        var img = new Image();
        //onload需要在赋值src之前，不然加载快的图片可能会在onload绑定上之前加载完毕。
        onload(img, url.element, onloadCallback);
        img.src = url.url;
    }
}


//onload事件回调
var firstScreenEndTime = +new Date();

function onloadCallback() {
    var thisEndTime = +new Date();
    //每次都做对比，直到找出最慢的一张
    if (thisEndTime > firstScreenEndTime) {
        firstScreenEndTime = thisEndTime;
    }
};

// 定时启动
setTimeout(function () {
    getTagImgList();
    getStyleImgList();
    getUniqueList();
    bindImgOnload();
    console.log(urlList)
}, 0)




var domReadyEndTime = +new Date();
//绑定domready事件
function bindDomReadyEvent() {
    var done = false;
    var ie = !!(window.attachEvent && !window.opera);
    var fn = function () {
        //同样domready有可能重复响应，所以需要判断一下
        if (!done) {
            done = true;
            domReadyEndTime = +new Date();
        }
    };
    if (ie) {
        //由于ie不支持DOMContentLoaded事件，因此采用不断执行doScroll的方式，
        //因为在ie中只有页面domready之后才会成功执行doScroll方法
        (function () {
            try {
                document.documentElement.doScroll('left');
            } catch (err) {
                //在domready之前执行doScroll会报错，在这里捕获异常之后继续执行doScroll
                setTimeout(arguments.callee, 0);
                return;
            }
            //没有异常发生时就可以执行回调了
            fn();
        })();
        //如果实在不执行doScroll，有的时候页面加载很快的时候，就直接在onload事件中去执行回调
        document.onreadystatechange = function () {
            if (document.readyState === 'complete') {
                document.onreadystatechange = null;
                fn();
            }
        };
    } else {
        //非IE浏览器直接监听DOMContentLoaded事件
        document.addEventListener('DOMContentLoaded', function () {
            fn();
        }, false);
    }
}
bindDomReadyEvent();




//兼容浏览器的事件监听函数
function addEvent(element, type, callback) {
    if (element.addEventListener) {
        element.addEventListener(type, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + type, callback);
    } else {
        element['on' + type] = callback;
    }
}

//发送数据
function sendData() {
    //需要发送的数据
    var data = {
        //统计类型
        type: 'performance',
        //页面id
        pageId: 'defualt',
        //白屏时间
        whiteScreenTime: whiteScreenEndTime - startTime,
        //首屏时间 有时候首屏取不到图片，就取domReady时间
        firstScreenTime: (firstScreenEndTime || domReadyEndTime) - startTime,
        //用户可操作时间
        domReadyTime: domReadyEndTime - startTime,
        //页面总下载时间
        onloadTime: onloadEndTime - startTime
    };

    console.log(data);
}


var onloadEndTime = +new Date();
//有可能此时页面已经加载完毕。
if (document.readyState === 'complete') {
    sendData();
} else {
    addEvent(window, 'load', function () {
        onloadEndTime = +new Date();
        sendData();
    });
}
