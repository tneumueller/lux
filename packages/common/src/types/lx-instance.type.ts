import { LxObjectPrototype } from './object.type'

export class LxInstance {
    rootModule: LxObjectPrototype

    constructor(rootModule: LxObjectPrototype) {
        this.rootModule = rootModule
    }
}