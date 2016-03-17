var path = require('path');
exports.path = process.platform === 'win32' ? path.join(__dirname, 'edgedriver', 'MicrosoftWebDriver.exe') : path.join(__dirname, 'edgedriver', 'edgedriver');
exports.start = function() {
  exports.defaultInstance = require('child_process').execFile(exports.path);
  return exports.defaultInstance;
};
exports.stop = function () {
  if (exports.defaultInstance !== null){
    exports.defaultInstance.kill();
  }
};
exports.md5 = '9d52449623934aa12001fb682828f6dc';
