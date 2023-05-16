exports.start = async function start (params: unknown) {
  const esmPkg = await import('../index.js')
  return esmPkg.start(params)
}

