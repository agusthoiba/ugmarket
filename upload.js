'use strict'

var fs = require('fs');
var config = require('./config');
var lwip = require('lwip');

module.exports = new Upload();

function Upload(){

}

Upload.prototype.createImageBase64 = function(base64Str, fileName, callback) {
    if (base64Str == null) {
        console.error('error upload.js:13:47');
        return callback('base64 string required');
    }

    var base64Arr = base64Str.split(',');
    var fullExt = base64Arr[0].substring(base64Arr[0].lastIndexOf(":")+1, base64Arr[0].lastIndexOf(";"));

    if (fullExt != 'image/jpeg' && fullExt != 'image/png') {
        return callback('Image extension must be jpg or png');
    }

    var ext = (fullExt ==  'image/jpeg') ?  'jpg' : 'png';

    var filePath = config.file_dir + fileName + '.' + ext;

    fs.writeFile(filePath, new Buffer(base64Arr[1], "base64"), function(err) {
      if (err) {
          console.error('error upload.js:30:73');
          return callback(err);
      }

      var fileUrl = config.file_host + fileName + '.' + ext;
      callback(null, {path: filePath, url: fileUrl, name: fileName, ext: ext});
    });
}

Upload.prototype.resize = function(src, maxWidth, maxHeight, fn){

    var imgArr = src.split('.');
    var ext = imgArr[imgArr.length - 1];
    lwip.open(src, ext, function(err, image) {
        if(err) return fn(err);

        var w = 0, h = 0;
        var ratio = image.width()/image.height();
        if (image.width() > image.height()) {
            w = image.width() > maxWidth ? maxWidth : image.width();
            h = w / ratio;
        } else {
            h = image.height() > maxHeight ? maxHeight : image.height();
            w = h * ratio;
        }

        image.batch().resize(w, h).writeFile(src, function(err){
           if(err) return fn(err);
           fn(null, src);
        })
    })
}
