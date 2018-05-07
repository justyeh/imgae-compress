
# image-compress

项目开发过程中经常遇到批量图片压缩的问题，虽然有一些在线的工具可以使用，但这些工具都有相应的限制，image-compress的目标是提供一个好用的、无限制的图片压缩工具。


[构建完成的压缩包](https://github.com/justyeh/imgae-compress/blob/master/publish/Image-Compress-win32-x64.rar)



## 特点

+ 支持jpg、png图片压缩
+ 支持图片+文件夹拖拽
+ 自定义压缩参数

## TODO

- [x]完成页面UI
- [x]文件拖拽遍历
- [x]设置文件的读取与保存
- [x]完成设置页面功能
- [x]文件压缩处理
- [x]构建为exe安装包

## screenshot

<img width="200" src="https://github.com/justyeh/imgae-compress/blob/master/publish/screenshot/img1.jpg">
<img width="200" src="https://github.com/justyeh/imgae-compress/blob/master/publish/screenshot/img2.jpg">
<img width="200" src="https://github.com/justyeh/imgae-compress/blob/master/publish/screenshot/GIF.gif">



## 构建

目前在构建上有需要改善的地方，目前精力有限，还没有找到好的解决办法，若果有好的建议，请联系我！

**electron-packager**

文件夹，可以使用

**electron-builder**

安装包，有bug

Error: Error in file: C:/Users/54657645/Desktop/images/1.jpg
spawn C:\Users\54657645\Desktop\imgae-compress\dist\win-unpacked\resources\app.asar\node_modules\jpeg-recompress-bin\vendor\jpeg-recompress.exe ENOENT

**windows-installer**

完全走不通

## dependencies

+ electron
+ fs-extra
+ imagemin
+ imagemin-jpegoptim
+ imagemin-pngquant
+ vue
