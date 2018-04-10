import { LXTemplateCompiler } from './template.compiler'

export class Lux {
}

export class LxCompiler {
    static compileAll(dir) {
        LXTemplateCompiler.compileAll(dir)
    }
}

LxCompiler.compileAll('../../example')
