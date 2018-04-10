export interface Object {
    __lx: {
        type: ObjectType
    },
    props?: any
    data?: any
}

export enum ObjectType {
    Component = 'component',
    Module = 'module'
}