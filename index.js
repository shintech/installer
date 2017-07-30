const fs = require('fs')
const pify = require('pify')
const yaml = require('js-yaml')
const execa = require('execa')
const path = require('path')
const chalk = require('chalk')
const currentDirectory = process.argv[2]
const pathDir = path.join(process.env['HOME'], 'opt', 'bin')
const config = path.join(currentDirectory, 'version.yml')
const pkg = path.join(currentDirectory, 'package.json')

fs.stat(pkg, (err, res) => {
  if (err && err.path === pkg) {
    console.log('package.json not found...\nchecking for config.yml...\n')
    checkForYaml()
  } else if (!err) {
    const _package = require(pkg)

    let command = `#!/usr/bin/env bash\n\nHOME=$HOME /usr/local/bin/node ${currentDirectory}/${_package.main} $(pwd) $1\n`

    console.log('package.json was found...\ninstalling...\n')
    writeToFile(_package.name, command, _package)
  } else {
    console.log(err)
  }
})

function checkForYaml () {
  try {
    const v = yaml.safeLoad(fs.readFileSync(config, 'utf8'))

    if (v.name !== undefined) {
      console.log('config.yml was found...\ninstalling...\n')

      let command = `#!/usr/bin/env bash\n\nHOME=$HOME /usr/local/bin/node ${currentDirectory}/${v.main} $(pwd) $1\n`

      writeToFile(v.name, command, v)
    } else {
      throw new Error('config.name is undefined...')
    }
  } catch (err) {
    if (err && err.path === config) {
      console.log('yaml not found...\naborting...\n')
    } else {
      console.log(err)
    }
  }
}

function writeToFile (filename, command, v) {
  pify(fs).writeFile(path.join(pathDir, filename), command)
  .then(function () {
    chmod(filename, v)
  })
}

function chmod (file, v) {
  execa.shell(`chmod +x ${path.join(pathDir, v.name)}`)
  .then(() => {
    console.log(`successfully installed => ${chalk.green(v.name)}`)
  })
}
