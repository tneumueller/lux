import * as path from 'path'
import * as fs from 'fs'
import md5 from 'md5'

export class LXTemplateCompiler {
    static compileAll(dir) {
        const hash = md5(new Date().toISOString())

        const indexHTMLTarget = path.resolve(__dirname, dir, 'dist/index.html')
        const indexHTMLPath = path.resolve(__dirname, dir, 'src/index.html')
        const htmlData = fs.readFileSync(indexHTMLPath).toString().replace('src="main.js"', `src="main.${ hash }.js"`)

        fs.writeFileSync(indexHTMLTarget, htmlData)

        const bundleTarget = path.resolve(__dirname, dir, `dist/main.${ hash }.js`)
        const bundlePath = path.resolve(__dirname, dir, 'dist/main.js')
        const bundleData = fs.readFileSync(bundlePath)
        fs.unlinkSync(bundlePath)
        fs.writeFileSync(bundleTarget, bundleData)
    }
}