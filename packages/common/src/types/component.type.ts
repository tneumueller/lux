import { LxObjectInstance, LxObjectPrototype, ObjectType } from './object.type'
import { Element, Template } from './template.type'

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

    target.prototype.bindAll = (_this: LxComponent) => {
        _this.bindToElement.bind(_this)
        _this.init.bind(_this)
        _this.render.bind(_this)
    }
}

export interface LxComponent extends LxObjectInstance {
    bindAll: Function
    bindToElement: Function
    init: Function
    render: Function
}

function init() {
    this.__lx.props.templateData = new Template(this.__lx.props.template)
}

function bindToElement(el: HTMLElement) {
    this.__lx.props.htmlAnker = el
}

function render() {
    console.log(this)
    if (!this.__lx.props.templateData || !this.__lx.props.templateData.nodes) {
        return
    }
    this.__lx.props.templateData.nodes.forEach((node: Element) => {
        this.__lx.props.htmlAnker.appendChild(createElement(node, this))
    })
}

function createElement(node: Element, _this): HTMLElement {
    const nodeElem = document.createElement(node.selector)

    console.log(node)
    if (!node.contentBindings && node.content) {
        nodeElem.innerHTML = node.content
    } else if (node.contentBindings) {
        node.contentBindings.forEach(binding => {
            if (binding.staticContent) {
                nodeElem.innerHTML += binding.staticContent
            } else {
                ({
                    ..._this,
                    __lx_eval_binding() {
                        nodeElem.innerHTML += eval(binding.dynamicContent)
                    }
                }).__lx_eval_binding()
                console.log(_this)
            }
        })
    }

    node.children.forEach(_n => {
        nodeElem.appendChild(createElement(_n, _this))
    })
    return nodeElem
}