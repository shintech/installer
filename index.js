const fs = require('fs')
const os = require('os')
const path = require('path')
const Shlogger = require("shlogger")
const { promisify } = require('util')
const checkIfPackageExists = require('./lib/checkIfPackageExists')
const getFilenameAndExtension = require('./lib/getFilenameAndExtension')
const getCommand = require('./lib/getCommand')
const writeFileToPath = require('./lib/writeFileToPath')

const exists = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)
const chmod = promisify(fs.chmod)

const FILEPATH = process.argv[2]
const HOME = os.homedir()
const PATH = path.join(HOME, 'opt', 'bin')

const logger = new Shlogger()

main()

async function main () {
  if (!FILEPATH) { throw new Error('No file path specified...') }

  const pkgExists = await checkIfPackageExists(exists(path.join(FILEPATH, 'package.json')))

  pkgExists ? logger.info('package.json was found...') : logger.info('package.json was not found...')

  let file = getFilenameAndExtension(pkgExists, FILEPATH)
  let command = getCommand(file, FILEPATH)

  try {
    logger.info(`Adding ${FILEPATH} to path...`)

    let write = await writeFileToPath(file, command, PATH, writeFile, chmod)

    logger.info(`${write}...`)
  } catch (err) {
    logger.error(`${err}...`)
  }
}
