export interface LxObjectPrototype {
    prototype: {
        __lx: LxObjectData
    }
}

export interface LxObjectInstance {
    __lx: LxObjectData
}

export interface LxObjectData {
    type: ObjectType
    props?: any
    previousState?: any
}

export enum ObjectType {
    Component = 'component',
    Module = 'module'
}