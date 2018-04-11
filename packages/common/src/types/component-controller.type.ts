import { LxObjectPrototype } from './object.type'

export class ComponentController {
    private static components: LxObjectPrototype[] = []

    static registerComponent(c: LxObjectPrototype) {
        if (this.components.map(c => c.prototype.__lx.props.selector).includes(c.prototype.__lx.props.selector)) {
            throw new Error(`Error while registering component: Selector <${c.prototype.__lx.props.selector}> is ambigous`)
        }
        this.components.push(c)
    }

    static getComponentBySelector(selector: string) {
        return this.components.filter(c => c.prototype.__lx.props.selector === selector)[0]
    }
}