import { ObjectType } from './object.type'

export interface ModuleProperties {
    declarations: any
    bootstrap: any
}

export const Module = (props: ModuleProperties) => (target: any) => {
    target.__lx = {
        type: ObjectType.Module
    }
    target.props = props
}