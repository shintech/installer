var fs = require('fs')
var pify = require('pify')
const yaml = require('js-yaml')
var execa = require('execa')
var path = require('path')
var chalk = require('chalk')
var currentDirectory = process.argv[2]
var pathDir = path.join(process.argv[3], 'opt', 'bin')
var config = path.join(currentDirectory, 'config.yml')
var command = `#!/usr/bin/env bash\n /usr/local/bin/node ${currentDirectory}/index.js $(pwd) $HOME\n`

fs.stat(config, (err, res) => {
  if (err) {
    console.log('config.yml not found...\naborting...')
    return
  }

  try {
    var v = yaml.safeLoad(fs.readFileSync(config, 'utf8'))
    if (v.app !== undefined) {
      var appName = v.app
      var filename = path.join(pathDir, appName)

      writeToFile(filename, command, v)
    } else {
      throw new Error('config.app is undefined...')
    }
  } catch (err) {
    throw new Error(err)
  }
})

function writeToFile (filename, command, v) {
  pify(fs).writeFile(filename, command)
  .then(function () {
    chmod(filename, v)
  })
}

function chmod (file, v) {
  execa.shell(`chmod +x ${path.join(pathDir, v.app)}`)
  .then(() => {
    console.log(`successfully installed => ${chalk.green(v.app)}`)
  })
}
