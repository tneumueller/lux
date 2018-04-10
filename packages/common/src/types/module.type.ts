import { ObjectType } from './object.type'

export interface ModuleProperties {
    declarations: any
    bootstrap: any
}

export const Module = (props: ModuleProperties) => (target: any) => {
    target.prototype.__lx = {
        type: ObjectType.Module
    }
    target.prototype.__lx.props = props
}