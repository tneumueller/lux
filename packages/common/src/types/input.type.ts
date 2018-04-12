import { LxObjectInput } from './object.type'

export const Input = (props?: LxObjectInput | number): any => (targetClass: any, targetName: string) => {
    const defaultValue = {
        value: undefined,
        ...getProps(props)
    }

    function getter() {
        if (!this.__lx.input[targetName]) {
            this.__lx.input[targetName] = defaultValue
        }
        return this.__lx.input[targetName].value
    }

    function setter(v: any) {
        if (!this.__lx.input[targetName]) {
            this.__lx.input[targetName] = {
                ...defaultValue,
                value: v
            }
        } else {
            this.__lx.input[targetName].value = v
        }
    }

    Object.defineProperty(targetClass, targetName, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    })
}

function getProps(props: LxObjectInput | number): LxObjectInput {
    if (!props) return {}

    const type = typeof props
    if (type === 'object') {
        return props as LxObjectInput
    } else if (type === 'number') {
        return { max: props as number }
    } else {
        throw new Error(`Invalid input property type ${type} - must be either number or object`)
    }
}