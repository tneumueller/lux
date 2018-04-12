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
    input?: {
        [key: string]: LxObjectInput
    }
    previousState?: any
}

export interface LxObjectInput {
    value?: any
    max?: number
}

export enum ObjectType {
    Component = 'component',
    Module = 'module'
}