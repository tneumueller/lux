import { LxObjectBinding, LxObjectInstance, LxObjectPrototype, ObjectType } from './object.type'
import { Element, Template } from './template.type'
import deepEqual from 'deep-equal'
import { ComponentController } from './component-controller.type'
import { take } from 'rxjs/operators'

export interface ComponentProperties {
    selector: string
    template?: string
    templateUrl?: string
}

export const Component = (props: ComponentProperties) => (target: any) => {
    if (!target.prototype.__lx) {
        target.prototype.__lx = {}
    }
    target.prototype.__lx = {
        ...target.prototype.__lx,
        type: ObjectType.Component,
        props: props,
        input: {},
        output: {}
    }

    target.prototype.bindToElement = bindToElement
    target.prototype.init = init
    target.prototype.render = render
    target.prototype.detectChanges = detectChanges

    target.prototype.bindAll = (_this: LxComponent) => {
        _this.bindToElement.bind(_this)
        _this.init.bind(_this)
        _this.render.bind(_this)
        _this.detectChanges.bind(_this)
    }

    ComponentController.registerComponent(target as LxObjectPrototype)
}

export interface LxComponent extends LxObjectInstance {
    bindAll: Function
    bindToElement: Function
    init: Function
    render: Function
    detectChanges: Function
}

function init() {
    this.__lx.props.templateData = new Template(this.__lx.props.template)
    console.log(this)

    setInterval(() => {
        if (this.detectChanges()) {
            this.render()
        }
    }, 100)
}

function bindToElement(el: HTMLElement) {
    this.__lx.props.htmlAnker = el
}

function detectChanges() {
    const pureThis = {
        ...this
    }
    for (let i in this.__lx.input) {
        if (this.__lx.input.hasOwnProperty(i)) {
            pureThis[i] = this.__lx.input[i].value
        }
    }


    if (!this.__lx.previousState) {
        this.__lx.previousState = pureThis
        return true
    }
    if (!deepEqual(this.__lx.previousState, pureThis)) {
        this.__lx.previousState = pureThis
        return true
    }
    return false
}

function render() {
    if (!this.__lx.props.templateData || !this.__lx.props.templateData.nodes) {
        return
    }
    this.__lx.props.templateData.nodes.forEach((node: Element) => {
        this.__lx.props.htmlAnker.appendChild(updateDOM(node, this))
    })
}

function updateDOM(node: Element, _this): HTMLElement {
    let nodeElem
    let newInnerHTML = ''

    if (node.contentAnker) {
        nodeElem = node.contentAnker
    } else {
        const comp = ComponentController.getComponentBySelector(node.selector) as any

        if (!comp) {
            nodeElem = document.createElement(node.selector)
            node.contentAnker = nodeElem
        } else {
            console.log(`found component matching selector <${node.selector}>:`, comp)

            const instance = new comp() as LxComponent
            nodeElem = document.createElement(node.selector)
            instance.bindAll(instance)
            instance.bindToElement(nodeElem)
            instance.init()

            node.component = instance
            node.contentAnker = instance.__lx.props.htmlAnker
        }


        // when creating the element, add all fixed attributes
        applyAttributes(node)
        applyEventBindings(_this, node)
        applyOutputBindings(_this, node)
    }

    applyInputBindings(_this, node)

    if (!node.component) {
        if (!node.children || !node.children.length) {
            if (!node.contentBindings && node.content) {
                newInnerHTML = node.content
            } else if (node.contentBindings) {
                node.contentBindings.forEach(binding => {
                    if (binding.staticContent) {
                        newInnerHTML += binding.staticContent
                    } else {
                        newInnerHTML += evalBinding(_this, binding.dynamicContent)
                    }
                })
            }
            if (nodeElem.innerHTML !== newInnerHTML) {
                // console.log(nodeElem.innerHTML, newInnerHTML)
                nodeElem.innerHTML = newInnerHTML
            }
        } else {
            node.children.forEach(_n => {
                const domElem = updateDOM(_n, _this)
                nodeElem.appendChild(domElem)
            })
        }
    }

    return nodeElem
}

function applyAttributes(node) {
    if (node.attributes && node.attributes.length) {
        node.attributes.forEach(attr => {
            node.contentAnker.setAttribute(attr.key, attr.value)
        })
    }
}

function applyInputBindings(_this, node: Element) {
    if (node.inputBindings && node.inputBindings.length) {
        node.inputBindings.forEach(attr => {
            if (node.component && node.component.__lx.input[attr.key]) {
                const binding = node.component.__lx.input[attr.key] as LxObjectBinding
                if (binding.max === undefined || binding.max > 0) {
                    binding.value = evalBinding(_this, attr.value)
                    binding.max--
                }
            } else {
                node.contentAnker.setAttribute(attr.key, evalBinding(_this, attr.value))
            }
        })
    }
}

function applyOutputBindings(_this, node) {
    if (node.outputBindings && node.outputBindings.length) {
        node.outputBindings.forEach(attr => {
            if (node.component && node.component.__lx.output[attr.key]) {
                const binding = node.component.__lx.output[attr.key] as LxObjectBinding
                let observable = binding.observable
                if (binding.max !== undefined) {
                    observable = observable.pipe(take(binding.max))
                }
                observable.subscribe(val => {
                    evalBinding(_this, `(${attr.value})=${val}`)
                })
            }
        })
    }
}

function applyEventBindings(_this, node) {
    if (node.eventBindings && node.eventBindings.length) {
        node.eventBindings.forEach(attr => {
            node.contentAnker.addEventListener(attr.key, ($event: any) => {
                if ($event.detail && $event.detail.isLxEvent) {
                    $event = $event.detail.data
                }
                (window as any).$event = $event
                evalBinding(_this, attr.value)
                delete (window as any).$event
            })
        })
    }
}

function evalBinding(_this, binding) {
    return function () {
        return eval(binding)
    }.call(_this)
}
