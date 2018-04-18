var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var os = require('os');

const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

var getImgList = (paths) => {
    var imgList = [];
    var getImgs = (dropPaths) => {
        dropPaths.forEach(pathStr => {
            var pathNormalize = path.normalize(pathStr);
            var pathInfo = fs.lstatSync(pathNormalize);
            if (pathInfo.isDirectory()) {
                var dirPathList = fs.readdirSync(pathNormalize);
                if (dirPathList.length > 0) {
                    dirPathList = dirPathList.map((item) => {
                        return path.join(pathNormalize, item)
                    })
                    getImgs(dirPathList)
                }
            } else {
                var fileExtname = path.extname(pathNormalize).toLowerCase();
                if (['.jpg', '.png'].indexOf(fileExtname) > -1) {
                    imgList.push({
                        path: pathNormalize,
                        size: pathInfo.size
                    })
                }
            }
        })
    }
    getImgs(paths)
    return imgList;
}
exports.getImgList = getImgList;



function getDeaktopDir() {
    return normalizePath(os.homedir() + '/Desktop')
}
exports.getDeaktopDir = getDeaktopDir;



function normalizePath(pathSrc) {
    return pathSrc.replace(/\\/g, "/")
}
exports.normalizePath = normalizePath;



var configFilePath = './compress-config.json'
function saveCompressConfig(setting) {
    fse.ensureFile(configFilePath).then(() => {
        if (setting.quality1 > setting.quality2) {
            var qualityMin = setting.quality2;
            var qualityMax = setting.quality1;
        } else {
            var qualityMin = setting.quality1;
            var qualityMax = setting.quality2;
        }
        var jsonStr = {
            "savePath": setting.savePath,
            "plugins": {
                "imageminJpegRecompress": {
                    "jpgQuality": setting.jpgQuality
                },
                "imageminPngquant": {
                    "qualityMin": qualityMin,
                    "qualityMax": qualityMax,
                    "speed": setting.speed
                }
            }
        }
        fse.writeJSON(configFilePath, jsonStr)
    });
}
exports.saveCompressConfig = saveCompressConfig;


function getCompressConfig() {
    if (fs.existsSync(configFilePath)) {
        return fse.readJSONSync(configFilePath)
    } else {
        var defaultConfig = {
            "savePath": getDeaktopDir(),
            "plugins": {
                "imageminJpegRecompress": {
                    "jpgQuality": 'high'
                },
                "imageminPngquant": {
                    "qualityMin": 65,
                    "qualityMax": 80,
                    "speed": 3
                }
            }
        }
        fse.writeJsonSync(configFilePath, defaultConfig);
        return defaultConfig;
    }
}
exports.getCompressConfig = getCompressConfig;

function imageCompressHandle(imgPath, callback) {
    var pluginsConfig = null;
    if(!pluginsConfig){
        pluginsConfig = getCompressConfig();
    }
    imagemin([imgPath], pluginsConfig.savePath + '/image-compress-build/', {
        plugins: [
            imageminPngquant({
                quality: pluginsConfig.plugins.imageminPngquant.qualityMin + '-' + pluginsConfig.plugins.imageminPngquant.qualityMax,
                speed: pluginsConfig.plugins.imageminPngquant.speed
            }),
            imageminJpegRecompress({
                accurate: true,//高精度模式
                quality: pluginsConfig.plugins.imageminJpegRecompress.jpgQuality,//图像质量:low, medium, high and veryhigh;
                method: "smallfry",//网格优化:mpe, ssim, ms-ssim and smallfry;
                min: 60,//最低质量
                loops: 0,//循环尝试次数, 默认为6;
                progressive: false,//基线优化
                subsample: "default"//子采样:default, disable;
            })
        ]
    }).then(files => {
        callback()
    }).catch(err => {
        fse.outputFile(pluginsConfig.savePath + '/image-compress-build/error.log', err)
    });

}
exports.imageCompressHandle = imageCompressHandle;
