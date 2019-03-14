import {
    getCurrentStyle,
    isHidden,
    isInFirstScreen,
    isCache,
    addEvent
} from '../util/lib';


try {


    /***
    获取首屏时间
    **/
    let urlList = [];
    //收集img标签中的图片url
    let getTagImgList = () => {
        let imgList = document.getElementsByTagName('img');
        for (let i = 0; i < imgList.length; i++) {
            let img = imgList[i];
            let url = img.getAttribute('src');
            //判断是否隐藏、是否在首屏、是否为非缓存
            if (!isCache(url)) {
                urlList.push({ element: img, url: url });
            }
        }
    }
    //收集背景样式中的图片url
    let getStyleImgList = () => {
        let styleList = document.getElementsByTagName('*');
        for (let i = 0, len = styleList.length; i < len; i++) {
            let element = styleList[i];
            //第一步判断是否隐藏及是否为图片，因为有判断专门为img的逻辑，这一步可以过滤掉大部分不相干的元素
            if (element.tagName !== 'IMG' && !isHidden(element)) {
                //取得元素的最终样式，避免获取覆盖的样式
                let background = getCurrentStyle(element, 'backgroundImage');
                //第二步判断是否设置了背景图片及是否在首屏
                if (background && background.indexOf('url') !== -1 && isInFirstScreen(element)) {
                    //提取出纯净的url地址
                    let url = background.split(/\(|\)/g)[1];
                    //ie两边会把双引号给带上
                    url = url.replace(/\"+/g, '');
                    urlList.push({ element: element, url: url });
                }
            }
        }
    }


    //url去重处理
    let getUniqueList = () => {
        let tempList = [];
        let temp = {};
        for (let i = 0, len = urlList.length; i < len; i++) {
            let url = urlList[i];
            if (!temp[url.url]) {
                temp[url.url] = true;
                tempList.push(url);
            }
        }
        urlList = tempList;
    }



    //绑定onload事件
    let onload = (img, element, callback) => {
        //判读是否为IE
        let ie = !!(window.attachEvent && !window.opera);
        let done = false;
        let fn = function () {
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
            let timer = window.setInterval(function () {
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
    let bindImgOnload = () => {
        for (let i = 0, len = urlList.length; i < len; i++) {
            let url = urlList[i];
            let img = new Image();
            //onload需要在赋值src之前，不然加载快的图片可能会在onload绑定上之前加载完毕。
            onload(img, url.element, onloadCallback);
            img.src = url.url;
        }
    }


    //onload事件回调
    let firstScreenEndTime = +new Date();

    let onloadCallback = () => {
        let thisEndTime = +new Date();
        //每次都做对比，直到找出最慢的一张
        if (thisEndTime > firstScreenEndTime) {
            firstScreenEndTime = thisEndTime;
        }
    };

    // 定时启动
    setTimeout(() => {
        getTagImgList();
        getStyleImgList();
        getUniqueList();
        bindImgOnload();
        console.log(urlList)
    }, 300)




    let domReadyEndTime = +new Date();
    //绑定domready事件
    let bindDomReadyEvent = () => {
        let done = false;
        let ie = !!(window.attachEvent && !window.opera);
        let fn = function () {
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



    //发送数据
    let sendData = () => {
        //需要发送的数据

        if (!window.startTime) {
            window.startTime = performance.timing.fetchStart;
        }

        if (!window.whiteScreenEndTime) {
            window.whiteScreenTime = performance.timing.responseEnd - performance.timing.fetchStart;
        }

        let data = {};
        window.performance.data = data = {
            //统计类型
            type: 'performance',
            //页面id
            pageId: window.pageId || 'defualt',
            //白屏时间
            whiteScreenTime: window.whiteScreenEndTime - window.startTime,
            //首屏时间 有时候首屏取不到图片，就取domReady时间
            firstScreenTime: (firstScreenEndTime || domReadyEndTime) - window.startTime,
            //用户可操作时间
            domReadyTime: domReadyEndTime - window.startTime,
            //页面总下载时间
            onloadTime: onloadEndTime - window.startTime
        };


        if (window._hmt) {
            _hmt.push(['_trackEvent', 'timing', 'whiteScreenTime', data.whiteScreenTime]);
            _hmt.push(['_trackEvent', 'timing', 'firstScreenTime', data.firstScreenTime]);
            _hmt.push(['_trackEvent', 'timing', 'domReadyTime', data.domReadyTime]);
            _hmt.push(['_trackEvent', 'timing', 'onloadTime', data.onloadTime]);
        } else {
            console.log(data);
        }




    }


    let onloadEndTime = +new Date();
    //有可能此时页面已经加载完毕。
    if (document.readyState === 'complete') {
        sendData();
    } else {
        addEvent(window, 'load', function () {
            onloadEndTime = +new Date();
            sendData();
        });
    }

} catch (e) {
    console.log(e);
}

export function getPerformanceData(callback) {
    try {
        setTimeout(() => {
            callback(window.performance.data);
        }, 1000);
    } catch (e) {
        console.log(e);
    }

    return;
}