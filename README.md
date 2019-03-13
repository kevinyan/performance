# Useage

### Setp1: head结束之前植入代码
```
<script type="text/javascript">
    window.whiteScreenEndTime = +new Date();
    window.pageId = "xfapp"
</script>

```


### Setp2: 引入```./dist``` 里的 ```app.bundle.js```


### 最终看起来如下

```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>TEST</title>
        <script type="text/javascript">
            window.whiteScreenEndTime = +new Date();
            window.pageId = "xfapp"
        </script>
        <script type="text/javascript" src="lib/app.bundle.js"></script>
    </head>

    <body>

    </body>
</html>
```
