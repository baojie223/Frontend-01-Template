const Generator = require('yeoman-generator')

module.exports = class extends Generator {

  async prompting() {
    this.dependencies = await this.prompt({
      type: 'input',
      name: 'name',
      message: '要什么框架?'
    })
  }

  writing() {
    const pkgJSON = {
      dependencies: {
        [this.dependencies.name]: "*"
      }
    }
    this.fs.extendJSON('./package.json')
  }
  installLodash() {
    this.npmInstall('lodash')
  }
}
