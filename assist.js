var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var os = require('os');

const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegoptim = require('imagemin-jpegoptim');

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
                if (['.jpg', '.png', '.jepg'].indexOf(fileExtname) > -1) {
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
                "imageminJpegoptim": {
                    "size": setting.size
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
                "imageminJpegoptim": {
                    "size": 500
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
            imageminJpegoptim({
                size: pluginsConfig.plugins.imageminJpegoptim.size
            })
        ]
    }).then(files => {
        callback()
    }).catch(err => {
        fse.outputFile(pluginsConfig.savePath + '/image-compress-build/error.log', err)
    });

}
exports.imageCompressHandle = imageCompressHandle;
