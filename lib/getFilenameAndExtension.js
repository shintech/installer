const path = require('path')

module.exports = function getFilenameAndExtension (pkg, filepath) {
  let filename, extension

  if (!pkg) {
    extension = path.extname(filepath)
    let split = filepath.split('/')

    filename = path.parse(split[split.length - 1]).name
  } else {
    const pkg = require(path.join(filepath, 'package.json'))

    extension = '.js'
    filename = pkg.name
  }

  return { filename, extension }
}
