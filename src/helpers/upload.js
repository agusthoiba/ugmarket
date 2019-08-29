var fs = require('fs');
var config = require('../config');
var sharp = require('sharp');

module.exports = new Upload();

function Upload(){

}

Upload.prototype.createImageBase64 = function(base64Str, fileName) {
    return new Promise((resolve, reject) => {
        if (base64Str == null) {
            return reject('first arguments base64 string required');
        }

        var base64Arr = base64Str.split(',');
        var fullExt = base64Arr[0].substring(base64Arr[0].lastIndexOf(":")+1, base64Arr[0].lastIndexOf(";"));

        if (fullExt != 'image/jpeg' && fullExt != 'image/png') {
            return reject('Image extension must be jpg or png');
        }

        var ext = (fullExt ==  'image/jpeg') ?  'jpg' : 'png';

        var filePath = config.file_dir + fileName + '.' + ext;

        return fs.writeFile(filePath, new Buffer(base64Arr[1], "base64"), err => {
            if (err) {
                return reject(err);
            }

            var fileUrl = config.file_host + fileName + '.' + ext;
            return resolve({path: filePath, url: fileUrl, name: fileName, ext: ext});
        });
    });
}

Upload.prototype.resize = function(src, dest, maxWidth, maxHeight){
    var imgArr = src.split('.');
    var ext = imgArr[imgArr.length - 1];

    return new Promise((resolve, reject) => {
        sharp(src).resize(maxWidth)
        .toFile(dest, (err, info) => {
            if(err) return reject(err)

            console.log('info upload large', JSON.stringify(info));
            resolve(src)
        });
    });
}
