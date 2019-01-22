module.exports = async function checkIfPackageExists (exists) {
  try {
    await exists
    return true
  } catch (err) {
    return false
  }
}
