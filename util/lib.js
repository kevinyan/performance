// 获取当前dom元素的CSS属性
let a = '12312';

let getCurrentStyle = (element, style) => {
    let newstyle = '';
    if (element.currentStyle) {
        //IE上兼容
        newstyle = div.currentStyle[style];
    } else {
        //火狐谷歌上兼容
        newstyle = window.getComputedStyle(element, null)[style]
    }
    return newstyle;
}


//判断是否隐藏
let isHidden = element => {
    //获取元素最终样式
    let display = getCurrentStyle(element, 'display');
    let visibility = getCurrentStyle(element, 'visibility');
    //获取元素宽高
    let width = element.offsetWidth;
    let height = element.offsetHeight;
    //对于绝对隐藏、相对隐藏、宽高为0的元素可以认为是不需要在首屏展示的
    return display === 'none' ||
        visibility === 'hidden' ||
        width === 0 ||
        height === 0;
}

//判断是否在首屏
let isInFirstScreen = element => {

    //获取元素距离浏览器可视区域的相对距离
    let client = element.getBoundingClientRect();
    return client.left >= 0 &&
        client.left < (document.documentElement.clientWidth || document.body.clientWidth) &&
        client.top >= 0 &&
        client.top < (document.documentElement.clientHeight || document.body.clientHeight);
}



//判读是否为非缓存图片
let isCache = url => {
    //排除掉一些无法缓存的图片，比如验证码,不带src属性的占位图片等
    return !url || url.indexOf('?') !== -1;
}


//兼容浏览器的事件监听函数
let addEvent = (element, type, callback) => {

    if (element.addEventListener) {
        element.addEventListener(type, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + type, callback);
    } else {
        element['on' + type] = callback;
    }
}


export {
    getCurrentStyle,
    isHidden,
    isInFirstScreen,
    isCache,
    addEvent
}