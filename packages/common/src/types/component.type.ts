import { LxObjectInstance, LxObjectPrototype, ObjectType } from './object.type'
import { Element, Template } from './template.type'
import deepEqual from 'deep-equal'

export interface ComponentProperties {
    selector: string
    template?: string
    templateUrl?: string
}

export const Component = (props: ComponentProperties) => (target: any) => {
    target.prototype.__lx = {
        type: ObjectType.Component,
        props: props
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
}

function bindToElement(el: HTMLElement) {
    this.__lx.props.htmlAnker = el
}

function detectChanges() {
    if (!this.__lx.previousState) {
        this.__lx.previousState = {...this}
        return true
    }
    if (!deepEqual(this.__lx.previousState, {...this})) {
        this.__lx.previousState = {...this}
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
        nodeElem = document.createElement(node.selector)
        node.contentAnker = nodeElem

        // when creating the element, add all fixed attributes
        applyAttributes(node)
        applyOutputBindings(_this, node)
    }

    applyInputBindings(_this, node)

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
            nodeElem.appendChild(updateDOM(_n, _this))
        })
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

function applyInputBindings(_this, node) {
    if (node.inputBindings && node.inputBindings.length) {
        node.inputBindings.forEach(attr => {
            node.contentAnker.setAttribute(attr.key, evalBinding(_this, attr.value))
        })
    }
}

function applyOutputBindings(_this, node) {
    if (node.outputBindings && node.outputBindings.length) {
        node.outputBindings.forEach(attr => {
            node.contentAnker[`on${attr.key}`] = ($event) => {
                (window as any).$event = $event

                evalBinding(_this, attr.value)

                delete (window as any).$event
            }
        })
    }
}

function evalBinding(_this, binding) {
    return function() { return eval(binding); }.call(_this);
}
