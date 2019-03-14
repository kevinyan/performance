# Useage
### Step1: 安装
```
npm i --save-dev @keelvin/performance
```


### Setp1: head结束之前植入代码
```
<script type="text/javascript">
    window.whiteScreenEndTime = +new Date();
    window.pageId = "xfapp"
</script>

```


### Setp2: 入口处```import```
 

```
import { getPerformanceData } from '@keelvin/performance';
```



# API
### getPerformanceData

- Fn : 获取页面性能数据以供它用
- Useage : 

```
// 异步调用
getPerformanceData((data) => {
    console.log(data);
})

```

