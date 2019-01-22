const path = require('path')

module.exports = function writeFileToPath ({ filename }, command, PATH, writeFile, chmod) {
  return new Promise(async function (resolve, reject) {
    try {
      let file = path.join(PATH, filename)

      await writeFile(file, command)
      await chmod(file, '0755')
      resolve('Success')
    } catch (err) {
      reject(new Error(err))
    }
  })
}
