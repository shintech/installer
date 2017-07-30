const fs = require('fs')
const pify = require('pify')
const yaml = require('js-yaml')
const execa = require('execa')
const path = require('path')
const chalk = require('chalk')
const logger = require('winston-color')
const currentDirectory = process.argv[2]
const pathDir = path.join(process.env['HOME'], 'opt', 'bin')
let config, pkg

if (currentDirectory !== undefined) {
  pkg = path.join(currentDirectory, 'package.json')
  config = path.join(currentDirectory, 'version.yml')

  fs.stat(pkg, (err, res) => {
    if (err && err.path === pkg) {
      logger.warn('package.json not found...')
      logger.warn('checking for config.yml...\n')
      checkForYaml()
    } else if (!err) {
      const _package = require(pkg)

      let command = `#!/usr/bin/env bash\n\n#${_package.name} - ${_package.version}\n\nHOME=$HOME /usr/local/bin/node ${currentDirectory}/${_package.main} $(pwd) $1\n`

      logger.info('package.json was found...')
      logger.info(`installing ${_package.name}...\n`)
      writeToFile(_package.name, command, _package)
    } else {
      logger.error(err)
    }
  })
} else {
  throw new Error('currentDirectory is undefined...')
}

function checkForYaml () {
  try {
    const v = yaml.safeLoad(fs.readFileSync(config, 'utf8'))

    if (v.name !== undefined) {
      logger.info('config.yml was found...')
      logger.info(`installing ${v.name}...\n`)

      let command = `#!/usr/bin/env bash\n\n#${v.name} - ${v.version}\n\nHOME=$HOME /usr/local/bin/node ${currentDirectory}/${v.main} $(pwd) $1\n`

      writeToFile(v.name, command, v)
    } else {
      throw new Error('config.name is undefined...')
    }
  } catch (err) {
    handleError(err, config)
  }
}

function handleError (err, filename) {
  if (err && err.path === filename) {
    let script = `${currentDirectory}/script.sh`

    logger.warn('version.yaml was not found...')
    logger.warn('checking for script.sh...\n')

    fs.stat(script, (err, res) => {
      if (err && err.path === script) {
        logger.error('script.sh not found...')
        logger.error('aborting...')
      } else if (!err || err.path !== script) {
        let name = currentDirectory.split('/')

        const v = {
          name: name[name.length - 1]
        }

        logger.info('script.sh was found...')
        logger.info(`installing ${v.name}...\n`)

        let command = `#!/usr/bin/env bash\n\n#${v.name}\n\nHOME=$HOME /usr/local/bin/node ${script} $(pwd) $1\n`
        writeToFile(v.name, command, v)
      } else {
        logger.error(err)
      }
    })
  } else {
    logger.error(err)
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
    logger.info(`successfully installed => ${chalk.green(v.name)}`)
  })
}
