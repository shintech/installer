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
  filepath = path.basename(path.join(currentDirectory, filepath))
  var filename = filepath.split('.').shift()
  getMessage(null, filename)
  writeToFile(filename, getCommand(filename, filepath))
} else {
  fs.stat(pkg).then(() => {
    const _package = require(pkg)
    getMessage(pkg, _package.name)
    writeToFile(_package.name, getCommand(_package.name, _package.main))
  })
  .catch(err => {
    logger.error(err)
  })
}

function getCommand (name, filepath) {
  return `#!/usr/bin/env bash\n\n#${name}\n\nHOME=$HOME /usr/local/bin/node ${currentDirectory}/${filepath} $(pwd) $1\n`
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
