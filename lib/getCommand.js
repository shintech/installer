module.exports = function getCommand ({ filename, extension }, FILEPATH) {
  if (!extension) {
    throw new Error('File extension not recognized')
  }

  let command

  if (extension === '.sh') {
    command = `/usr/bin/env bash ${FILEPATH} "\${1}" "\${2}" "\${3}"`
  }

  if (extension === '.js') {
    command = `HOME=$HOME /usr/local/bin/node ${FILEPATH} "\${1}"`
  }

  return `#!/usr/bin/env bash\n\n#${filename}\n\n${command}\n`
}
