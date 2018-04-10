import { Object, ObjectType } from './object.type'

export interface ComponentProperties {
    selector: string
    template?: string
    templateUrl?: string
}

export const Component = (props: ComponentProperties) => (_target: any) => {
    const target = _target as LxComponent
    target.__lx = {
        type: ObjectType.Component
    }
    target.props = props

    target.bindToElement = bindToElement.bind(target.props)
}

export interface LxComponent extends Object {
    bindToElement: Function
}

function bindToElement(el: HTMLElement) {
    this.htmlAnker = el
    this.htmlAnker.innerHTML = this.template
}