async function start (params: unknown) {
  const esmPkg = await import('../index.js')
  return esmPkg.start(params)
}

async function download (params?: string) {
  const esmPkg = await import('../index.js')
  return esmPkg.download(params)
}

exports.start = start
exports.download = download
module.exports = { start, download }
