var fs = require('fs');
var path = require('path');
 
// var pathd = __dirname + '\Desktop'

// 根目录
let BASEPATHURL = path.resolve(__dirname, '..')
 
let rootPath 
let replaceData = [
    {
        start: BASEPATHURL + "/nodetest/replace", // 移动目录
        end: BASEPATHURL + "/nodetest/replaces" // 删除目录
    },
    {
        start: BASEPATHURL + "/nodetest/replace1",
        end: BASEPATHURL + "/nodetest/replace1s"
    }
]
var startDate = new Date().getTime()


// 删除复制执行
replaceData.forEach((v) => {
    rootPath = v.end
    rmDirFile(v.end, () => {
        console.log("全部删除完成，开始复制")
        copyDir(v.start, v.end, (res) => {
            console.log("全部复制完成")
            console.log("修改文件内容")
        })
    });
}) 
 
 
// 删除
function rmDirFile(path, cb) {
    let files = [];
    console.log("开始删除")
    console.log(__dirname)
    if (fs.existsSync(path)) {
        var count = 0
        var checkEnd = function () {
            console.log("进度", count)
            ++count == files.length && cb && cb()
        }
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                console.log("遇到文件夹", curPath)
                rmDirFile(curPath, checkEnd);
            } else {
                fs.unlinkSync(curPath);
                console.log("删除文件完成", curPath)
                checkEnd()
            }
        });
        // 如果删除文件夹为放置文件夹根目录  不执行删除
        if (path == rootPath) {
            console.log("删除文件夹完成", path)
        } else {
            fs.rmdirSync(path);
        }
        //为空时直接回调
        files.length === 0 && cb && cb()
    } else {
        cb && cb()
    }
}
 
// 复制文件
function copyFile(srcPath, tarPath, cb) {
    var rs = fs.createReadStream(srcPath)
    rs.on('error', function (err) {
        if (err) {
            console.log('read error', srcPath)
        }
        cb && cb(err)
    })
 
    var ws = fs.createWriteStream(tarPath)
    ws.on('error', function (err) {
        if (err) {
            console.log('write error', tarPath)
        }
        cb && cb(err)
    })
 
    ws.on('close', function (ex) {
        cb && cb(ex)
    })
 
    rs.pipe(ws)
    console.log("复制文件完成", srcPath)
}
 
// 复制文件夹所有
function copyDir(srcDir, tarDir, cb) {
    if (fs.existsSync(tarDir)) {
        fs.readdir(srcDir, function (err, files) {
            var count = 0
            var checkEnd = function () {
                console.log("进度", count)
                ++count == files.length && cb && cb()
            }
 
            if (err) {
                checkEnd()
                return
            }
 
            files.forEach(function (file) {
                var srcPath = path.join(srcDir, file)
                var tarPath = path.join(tarDir, file)
 
                fs.stat(srcPath, function (err, stats) {
                    if (stats.isDirectory()) {
                        fs.mkdir(tarPath, function (err) {
                            if (err) {
                                console.log(err)
                                return
                            }
 
                            copyDir(srcPath, tarPath, checkEnd)
                            console.log("复制文件完成", srcPath)
                        })
                    } else {
                        copyFile(srcPath, tarPath, checkEnd)
                        console.log("复制文件完成", srcPath)
                    }
                })
            })
 
            //为空时直接回调
            files.length === 0 && cb && cb()
        })
 
    } else {
        fs.mkdir(tarDir, function (err) {
            if (err) {
                console.log(err)
                return
            }
            console.log('创建文件夹', tarDir)
            copyDir(srcDir, tarDir, cb)
        })
    }
 
}
