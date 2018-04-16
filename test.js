const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegoptim = require('imagemin-jpegoptim');

var pluginsConfig = getCompressConfig();
var imgPath = '' 
imagemin(imgPath, pluginsConfig.savePath + '/image-compress-build/', {
    plugins: [
        imageminPngquant({
            quality: pluginsConfig.plugins.imageminPngquant.qualityMin + '-' + pluginsConfig.plugins.imageminPngquant.qualityMax,
            speed: pluginsConfig.plugins.imageminPngquant.speed
        }),
        imageminJpegoptim({
            size: pluginsConfig.plugins.imageminJpegoptim.size
        }),
    ]
}).then(files => {
    if (typeof callback == 'function') {
        callback()
    }
}).catch(err=>{
    callback(err)
});