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
    }

    if (!node.children || !node.children.length) {
        if (!node.contentBindings && node.content) {
            newInnerHTML = node.content
        } else if (node.contentBindings) {
            node.contentBindings.forEach(binding => {
                if (binding.staticContent) {
                    newInnerHTML += binding.staticContent
                } else {
                    ({
                        ..._this,
                        __lx_eval_binding() {
                            newInnerHTML += eval(binding.dynamicContent)
                        }
                    }).__lx_eval_binding()
                }
            })
        }
        if (nodeElem.innerHTML !== newInnerHTML) {
            console.log(nodeElem.innerHTML, newInnerHTML)
            nodeElem.innerHTML = newInnerHTML
        }
    } else {
        node.children.forEach(_n => {
            nodeElem.appendChild(updateDOM(_n, _this))
        })
    }
    return nodeElem
}