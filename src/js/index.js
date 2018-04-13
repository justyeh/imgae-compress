const { ipcRenderer } = require('electron');
const { normalizePath, saveCompressConfig, getCompressConfig } = require('./../../assist');

const Vue = require('vue/dist/vue.js');

//范围选择组件
Vue.component('range', {
    template: "#range",
    props: {
        value: {
            default: 0
        },
        max: {
            default: 100
        }
    },
    data() {
        return {
            isMouseDown: false,
            elRange: null,
            elTrack: null,
            focus: false,
            rangeValue: 0,
            rangeMax: 0,
        }
    },
    watch: {
        value(newVal, oldVal) {
            this.rangeValue = newVal;
            this.setThumbPos();
        }
    },
    mounted() {
        this.rangeMax = parseInt(this.max)
        this.rangeValue = parseInt(this.value)
        this.elRange = this.$refs.elRange;
        this.elThumb = this.$refs.elThumb;
        this.setThumbPos();

        window.addEventListener('mousemove', e => {
            this.mousemoveHandler(e)
        });

        window.addEventListener('mouseup', () => {
            this.mouseupHandler()
        });
    },
    methods: {
        mouseupHandler() {
            this.isMouseDown = false;
            this.focus = false;

        },
        mousemoveHandler(e) {
            if (this.isMouseDown) {
                var moveOffset = e.pageX - this.getOffsetLeft(this.$refs.elRange);
                if (moveOffset <= 0) {
                    this.rangeValue = 0;
                    this.setThumbPos();
                    return;
                }
                if (moveOffset >= this.elRange.offsetWidth) {
                    this.rangeValue = this.rangeMax;
                    this.setThumbPos();
                    return;
                }
                this.rangeValue = (moveOffset / this.elRange.offsetWidth * this.rangeMax).toFixed();
                this.setThumbPos();
                this.$emit('update:value', this.rangeValue);
            }
        },
        setThumbPos() {

            //display为none，获取不到width
            var stepWidth = this.elRange.offsetWidth / this.rangeMax;
            var thumbWidth = this.elThumb.offsetWidth;
            this.elThumb.style.left = this.rangeValue * stepWidth - thumbWidth / 2 + 'px'

            console.log(this.elRange.offsetWidth)
        },
        getOffsetLeft(_el) {
            var left = 0;
            var offsetParent = _el;
            while (offsetParent != null && offsetParent != document.body) {
                left += offsetParent.offsetLeft;
                offsetParent = offsetParent.offsetParent;
            }
            return left;
        }
    }
})



var vm = new Vue({
    el: ".app",
    data: {
        list: [{
            path: "C:/Users/54657645/Desktop/151719604925.jpg",
            size: 466426
        }],
        settingShow: false,
        savePath: '',
        size: 0,
        quality1: 0,
        quality2: 0,
        speed: 0
    },
    mounted() {
        var comressconfig = getCompressConfig();
        this.savePath = comressconfig.savePath;
        this.size = comressconfig.plugins.imageminJpegoptim.size;
        this.quality1 = comressconfig.plugins.imageminPngquant.qualityMin;
        this.quality2 = comressconfig.plugins.imageminPngquant.qualityMax;
        this.speed = comressconfig.plugins.imageminPngquant.speed;

        this.setLinePos();
    },
    watch: {
        quality1() {
            this.setLinePos()
        },
        quality2() {
            this.setLinePos()
        }
    },
    methods: {
        //设置范围选择的高亮线
        setLinePos() {
            var min = this.quality1;
            var max = this.quality2;
            if (min > max) {
                var temp = max;
                max = min;
                min = temp
            }
            document.querySelector(".line").style.left = min + '%'
            document.querySelector(".line").style.right = (100 - max) + '%'
        },
        //保存设置
        saveSetting() {
            this.settingShow = false;
            var setting = {
                savePath: this.savePath,
                size: this.size,
                quality1: this.quality1,
                quality2: this.quality2,
                speed: this.speed
            }
            saveCompressConfig(setting)
            //ipcRenderer.send('save-setting', setting)
        },
        //最小化窗口
        minWindow() {
            ipcRenderer.send('window-handle', 'min')
        },
        //关闭
        closeWindow() {
            ipcRenderer.send('window-handle', 'close')
        },
        //打开目录选择面板
        openDialog() {
            ipcRenderer.send('select-directory')
        }
    }
})



//实现文件拖拽
var _main = $(".main");
_main.ondragover = () => {
    return false;
};
_main.ondragleave = () => {
    return false;
};
_main.ondragend = () => {
    return false;
};
_main.ondrop = (e) => {
    e.preventDefault();
    var dropPaths = [];
    for (let f of e.dataTransfer.files) {
        dropPaths.push(f.path.replace(/\\/g, "/"));
    }
    ipcRenderer.send('file-drop', dropPaths);
};
ipcRenderer.on('drop-imgs', (event, arg) => {
    vm.list = arg;
    console.log(arg[0])
})


//目录选择完毕
ipcRenderer.on('directory-selected', (event, arg) => {
    vm.savePath = normalizePath(arg);
})


//实现图片左右对比效果
var _compare = $(".compare");
_compare.onmousemove = function (event) {
    $(".separator").style.left = event.clientX - _compare.offsetLeft + 'px';
    $(".img-compressed").style.width = event.clientX - _compare.offsetLeft + 'px';
}

//简易的jquery方法
function $(selector) {
    return document.querySelector(selector);
}