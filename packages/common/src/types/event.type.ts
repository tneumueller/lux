import { LxObjectBinding } from './object.type'

export class EventEmitter<T> {
    private element: HTMLElement
    private eventName: string
    private constr: any

    constructor(eventName: string, constr: any) {
        this.eventName = eventName
        this.constr = constr
    }

    public linkTo(el: HTMLElement) {
        this.element = el
    }

    public emit(e: T) {
        const event = new CustomEvent(this.eventName, { detail: { isLxEvent: true, data: e } })
        this.element.dispatchEvent(event)
    }
}

export const Event = (eventName?: string): any => (targetClass: any, targetName: string) => {
    const emitter = new EventEmitter<any>(eventName || targetName, targetClass)

    function getter() {
        emitter.linkTo(this.__lx.props.htmlAnker)
        return emitter
    }

    Object.defineProperty(targetClass, targetName, {
        get: getter,
        enumerable: true,
        configurable: true
    })
}

function getProps(props: LxObjectBinding | number): LxObjectBinding {
    if (!props) return {}

    const type = typeof props
    if (type === 'object') {
        return props as LxObjectBinding
    } else if (type === 'number') {
        return { max: props as number }
    } else {
        throw new Error(`Invalid output property type ${type} - must be either number or object`)
    }
}