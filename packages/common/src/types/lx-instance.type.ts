import { Object } from './object.type'

export class LxInstance {
    rootModule: Object

    constructor(rootModule: Object) {
        this.rootModule = rootModule
    }
}