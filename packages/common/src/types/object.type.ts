import { Observable } from 'rxjs/Observable'
import { EventEmitter } from './event.type'

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
        [key: string]: LxObjectBinding
    }
    output?: {
        [key: string]: LxObjectBinding
    }
    previousState?: any
}

export interface LxObjectBinding {
    value?: any
    max?: number
    observable?: Observable<any>
}

export enum ObjectType {
    Component = 'component',
    Module = 'module'
}