const fs = require("fs")
const os = require("os")
const path = require('path')
const winston = require('winston')
const { promisify } = require("util")

const exists = promisify(fs.exists)
const writeFile = promisify(fs.writeFile)
const chmod = promisify(fs.chmod)

const PATH = path.join(process.env['HOME'], 'opt', 'bin')
const FILEPATH = process.argv[2]
const HOME = os.homedir()
const PWD = process.cwd()

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console()
  ],

  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
})

async function main () {
  const pkgExists = await exists(path.join(FILEPATH || PWD, 'package.json'))

  let ext, newPath, filename

  if (FILEPATH !== undefined && !pkgExists) {
    newPath = path.join(PWD, FILEPATH)
    ext = path.extname(FILEPATH)

    let split = newPath.split('/')

    filename = path.parse(split[split.length - 1]).name
  } else if (pkgExists) {
    const pkg = require(path.join(PWD, 'package.json'))

    newPath = PWD
    ext = '.js'
    filename = pkg.name
  } else {
    throw new Error('No filepath specified and no package.json found')
  }

  let command = getCommand(filename, newPath, ext)
  
  try {
    let file = path.join(PATH, filename)
    
    logger.info(`Adding ${file} to PATH...`)
    
    await writeFile(file, command)
    await chmod(file, 0755)
  } catch (err) {
    throw new Error('Error writing file')
  }
}

main()


function getCommand (name, filepath, extension) {
  if (!extension) { throw new Error('File extension not recognized') }

  let command
  
  if (extension === '.sh') {
    command = `/usr/bin/env bash ${filepath} "\${1}" "\${2}" "\${3}"`
  }

  if (extension === '.js') {
    command = `HOME=$HOME /usr/local/bin/node ${filepath} $(pwd) "\${1}"`
  }

  return `#!/usr/bin/env bash\n\n#${name}\n\n${command}\n`
}
