import { LxObjectBinding } from './object.type'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

export const Output = (props?: LxObjectBinding | number): any => (targetClass: any, targetName: string) => {
    const subject = new BehaviorSubject<any>(null)
    const defaultValue: LxObjectBinding = {
        value: undefined,
        observable: subject.asObservable(),
        ...getProps(props)
    }

    function getter() {
        if (!this.__lx.output[targetName]) {
            this.__lx.output[targetName] = defaultValue
        }
        return this.__lx.output[targetName].value
    }

    function setter(v: any) {
        if (!this.__lx.output[targetName]) {
            this.__lx.output[targetName] = {
                ...defaultValue,
                value: v
            }
        } else {
            this.__lx.output[targetName].value = v
        }
        subject.next(v)
    }

    Object.defineProperty(targetClass, targetName, {
        get: getter,
        set: setter,
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