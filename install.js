'use strict'

var cp = require('child_process')
var fs = require('fs')
var helper = require('./lib/edgedriver')
var request = require('request')
var kew = require('kew')
var npmconf = require('npmconf')
var mkdirp = require('mkdirp')
var path = require('path')
var rimraf = require('rimraf').sync
var url = require('url')
var util = require('util')
var md5file = require('md5-file')
var os = require('os')


var libPath = path.join(__dirname, 'lib', 'edgedriver')

// Select Microsoft WebDriver to download
var microsoftWebDriverDownloadUrls = {
  '14393': 'https://download.microsoft.com/download/3/2/D/32D3E464-F2EF-490F-841B-05D53C848D15/MicrosoftWebDriver.exe',
  '15063': 'https://download.microsoft.com/download/3/4/2/342316D7-EBE0-4F10-ABA2-AE8E0CDF36DD/MicrosoftWebDriver.exe',
  '16299': 'https://download.microsoft.com/download/D/4/1/D417998A-58EE-4EFE-A7CC-39EF9E020768/MicrosoftWebDriver.exe',
  '17134': 'https://download.microsoft.com/download/F/8/A/F8AF50AB-3C3A-4BC4-8773-DC27B32988DD/MicrosoftWebDriver.exe',
}
var osBuildNumber = os.release().split('.')[2]
var downloadUrl = ''
if (osBuildNumber in microsoftWebDriverDownloadUrls) {
  downloadUrl = microsoftWebDriverDownloadUrls[osBuildNumber]
}

console.log('downloadUrl: ' + downloadUrl)

var fileName = 'MicrosoftWebDriver.exe';

npmconf.load(function(err, conf) {
  if (downloadUrl === '') {
    console.warn('NOTE: Cannot find Microsoft WebDriver for the current OS:', process.platform, process.arch, os.release())
    process.exit(0)
    return
  }

  if (err) {
    console.log('Error loading npm config')
    console.error(err)
    process.exit(1)
    return
  }

  var tmpPath = findSuitableTempDirectory(conf)
  var downloadedFile = path.join(tmpPath, fileName)
  var promise = kew.resolve(true)

  // Start the install.
  promise = promise.then(function () {
    console.log('Downloading', downloadUrl)
    console.log('Saving to', downloadedFile)
    return requestBinary(downloadUrl, downloadedFile)
  })
  .then(function () {
    return copyIntoPlace(tmpPath, libPath)
  })
  .then(function () {
    console.log('Done. edgedriver binary available at',  libPath+"\\MicrosoftWebDriver.exe")
  })
  .fail(function (err) {
    console.error('edgedriver installation failed', err, err.stack)
    process.exit(1)
  })
})


function findSuitableTempDirectory(npmConf) {
  var now = Date.now()
  var candidateTmpDirs = [
    process.env.TMPDIR || '/tmp',
    npmConf.get('tmp'),
    path.join(process.cwd(), 'tmp')
  ]

  for (var i = 0; i < candidateTmpDirs.length; i++) {
    var candidatePath = path.join(candidateTmpDirs[i], 'edgedriver')

    try {
      mkdirp.sync(candidatePath, '0777')
      var testFile = path.join(candidatePath, now + '.tmp')
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      return candidatePath
    } catch (e) {
      console.log(candidatePath, 'is not writable:', e.message)
    }
  }

  console.error('Can not find a writable tmp directory, please report issue on https://github.com/barretts/edgedriver/issues/ with as much information as possible.');
  process.exit(1);
}


function requestBinary(_downloadUrl, filePath) {
  var deferred = kew.defer()

  request
      .get(_downloadUrl)
      .on('error', function (err) {
          deferred.reject('Error with http request: ' + util.inspect(response.headers))
      })
      .on('end', function () {
          deferred.resolve(true)
      })
      .pipe(fs.createWriteStream(filePath))

  return deferred.promise
}


function validateMd5(filePath, md5value) {
  var deferred = kew.defer()

  console.log('Validating MD5 checksum')

  try {
    if (md5file(filePath).toLowerCase() == md5value.toLowerCase()) {
      deferred.resolve(true)
    } else {
      deferred.reject('Error archive md5 checksum does not match')
    }
  } catch (err) {
    deferred.reject('Error trying to match md5 checksum')
  }

  return deferred.promise
}


function copyIntoPlace(tmpPath, targetPath) {
  rimraf(targetPath);
  console.log("Copying to target path", targetPath);
  fs.mkdirSync(targetPath);

  // Look for the extracted directory, so we can rename it.
  var files = fs.readdirSync(tmpPath);
  var promises = files.map(function (name) {
    var deferred = kew.defer();

    var file = path.join(tmpPath, name);
    var reader = fs.createReadStream(file);

    var targetFile = path.join(targetPath, name);
    var writer = fs.createWriteStream(targetFile);
    writer.on("close", function() {
      deferred.resolve(true);
    });

    reader.pipe(writer);
    return deferred.promise;
  });

  return kew.all(promises);
}
