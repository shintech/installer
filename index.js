const pify = require('pify')
const fs = pify(require('fs'))
const execa = require('execa')
const path = require('path')
const chalk = require('chalk')
const logger = require('winston-color')
const currentDirectory = process.argv[2]
var filepath = process.argv[3]
const pathDir = path.join(process.env['HOME'], 'opt', 'bin')
var pkg = path.join(currentDirectory, 'package.json')

if (filepath !== undefined) {
  var newpath = path.basename(path.join(currentDirectory, filepath))
  var filename = newpath.split('.')
  var extension = filename.pop()

  getMessage(null, filename[0])
  writeToFile(filename[0], getCommand(filename[0], filepath, extension))
} else {
  fs.stat(pkg).then(() => {
    const _package = require(pkg)
    getMessage(pkg, _package.name)
    writeToFile(_package.name, getCommand(_package.name, path.join(currentDirectory, _package.main), 'js'))
  })
  .catch(err => {
    logger.error(err)
  })
}

function getCommand (name, filepath, extension) {
  let ext

  if (extension === 'sh') {
    ext = `/usr/bin/env bash ${filepath} $1 $2 $3`
  }

  if (extension === 'js') {
    ext = `HOME=$HOME /usr/local/bin/node ${filepath} $pwd $1`
  }

  return `#!/usr/bin/env bash\n\n#${name}\n\n${ext}\n`
}

function getMessage (file, filename) {
  file ? logger.info(`${chalk.yellow('package.json')} was found...`) : logger.info(`cli argument ${chalk.yellow(filepath)} was provided...`)

  logger.info(`installing ${chalk.green(filename)}...`)
}

function writeToFile (file, command) {
  fs.writeFile(path.join(pathDir, file), command)
  .then(function () {
    chmod(file)
  })
}

function chmod (file, filepath) {
  execa.shell(`chmod +x ${path.join(pathDir, file)}`)
  .then(() => {
    logger.info(`successfully installed => ${chalk.green(file)}...`)
  })
  .catch(err => {
    logger.error(err)
  })
}
