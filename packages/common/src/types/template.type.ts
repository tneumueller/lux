interface Tag {
    begin: number
    end: number
    selfClosing: boolean
    closing: boolean
    content: string
    attributes?: Attribute[]
    inputBindings?: Attribute[]
    outputBindings?: Attribute[]
}

export interface Element {
    selector: string
    begin: number
    end: number
    children: Element[]
    content?: string
    contentAnker?: HTMLElement
    contentBindings?: ContentBinding[]
    attributes?: Attribute[]
    inputBindings?: Attribute[]
    outputBindings?: Attribute[]
}

interface Attribute {
    key: string
    value: string
}

export interface ContentBinding {
    dynamicContent?: string
    staticContent?: string
}

export class Template {
    public nodes: Element[] = []

    constructor(markup: string) {
        this.parse(markup.trim())
    }

    private parse(m: string) {
        let elem: Element, pos = 0
        while (elem = this.findNextElement(m, pos)) {
            this.nodes.push(elem)
            pos = elem.end
        }
        this.nodes.forEach(node => {
            this.createBindings(node)
        })
        console.log('Nodes:', this.nodes)
    }

    private createBindings(node: Element) {
        if (!node.children.length && node.content) {
            let binding, pos = 0
            while ((binding = node.content.indexOf('{{', pos)) > -1) {
                if (!node.contentBindings) {
                    node.contentBindings = []
                }

                const bindingEnd = this.findClosingBracket(node.content, binding)
                const bindingStr = node.content.substr(binding + 2, bindingEnd - binding - 3).trim()

                if (pos < binding) {
                    // there was some text between the end of the last binding and the beginning of this one
                    node.contentBindings.push({
                        staticContent: node.content.substr(pos, binding - pos)
                    })
                }

                node.contentBindings.push({
                    dynamicContent: bindingStr
                })
                pos = bindingEnd + 1
            }

            if (node.contentBindings && pos < node.content.length) {
                node.contentBindings.push({
                    staticContent: node.content.substr(pos, node.content.length - pos)
                })
            }

            // console.log('Bindings:', node.contentBindings)

        } else {
            node.children.forEach(_node => {
                this.createBindings(_node)
            })
        }
    }

    private findNextElement(s: string, start: number): Element {
        // console.log(s.substr(start, s.length - start))

        for (; start < s.length; ++start) {
            if (s.substr(start, 1) === '<') {
                break
            }
        }
        if (start >= s.length) return null

        const openTag = this.findNextTag(s, start)
        if (openTag.closing) return null

        console.log('open', openTag)

        if (openTag.selfClosing) {
            //console.log('self-close', openTag)
            return {
                begin: start,
                end: openTag.end + 1,
                children: [],
                selector: openTag.content,
                attributes: openTag.attributes,
                inputBindings: openTag.inputBindings,
                outputBindings: openTag.outputBindings,
            }
        } else {
            const nextTag = this.findNextTag(s, openTag.end + 1)
            if (!nextTag) return null
            if (nextTag.closing) {
                if (nextTag.content !== openTag.content) {
                    throw new Error(`Unexpected closing tag <${ nextTag.content }>`)
                }

                // console.log('close', nextTag.content)
                return {
                    begin: start,
                    end: nextTag.end + 1,
                    children: [],
                    selector: openTag.content,
                    content: s.substr(openTag.end, nextTag.begin - openTag.end),
                    attributes: openTag.attributes,
                    inputBindings: openTag.inputBindings,
                    outputBindings: openTag.outputBindings,
                }
            }

            const children: Element[] = []
            let pos = openTag.end
            let end = -1

            while (true) {
                const e = this.findNextElement(s, pos)

                // console.log(`element:`, e)

                if (!e) {
                    // two possibilities: end of the string or closing tag of this element
                    const nextTag = this.findNextTag(s, pos)

                    if (nextTag && nextTag.closing) {
                        if (nextTag.content !== openTag.content) {
                            throw new Error(`Unexpected closing tag <${ nextTag.content }>`)
                        }
                        end = nextTag.end
                    }
                    else end = pos

                    break
                }

                children.push(e)
                pos = e.end + 1
            }

            return {
                begin: start,
                end: end + 1,
                children,
                selector: openTag.content,
                attributes: openTag.attributes,
                inputBindings: openTag.inputBindings,
                outputBindings: openTag.outputBindings,
            }
        }
    }

    private findNextTag(s: string, start: number): Tag {
        for (let i = start; i < s.length; ++i) {
            const c = s.substr(i, 1)
            if (c === '<') {
                // tag opens here
                const end = this.findClosingBracket(s, i) + 1
                const tag = s.substr(i, end - i)
                const closing = this.isTagClosing(tag)
                return {
                    begin: i,
                    end,
                    selfClosing: this.isTagSelfClosing(tag),
                    closing,
                    content: this.stripTag(tag.trim()).trim(),
                    ...(closing ? {} : this.getTagAttributes(tag.trim()))
                }
            }
        }
        return null
    }

    private getTagAttributes(tag: string) {
        const attrs = {}
        const attrGroups = [
            {
                name: 'attributes',
                regex: /(([\w-]+))=["']/g
            },
            {
                name: 'inputBindings',
                regex: /(\[([\w-]+)\])=["']/g
            },
            {
                name: 'outputBindings',
                regex: /(\(([\w-]+)\))=["']/g
            }
        ]

        attrGroups.forEach(group => {
            const attributes: Attribute[] = []
            let m

            while (m = group.regex.exec(tag)) {
                console.log(m)
                if (m.index === group.regex.lastIndex) {
                    group.regex.lastIndex++
                }
                const attrValueStart = m.index + m[1].length + 1
                const attrValueEnd = this.findClosingString(tag, attrValueStart)
                const attrValue = tag.substr(attrValueStart + 1, attrValueEnd - attrValueStart - 1)
                attributes.push({
                    key: m[2],
                    value: attrValue
                })
            }

            attrs[group.name] = attributes
        })
        console.log(attrs)
        return attrs
    }

    private isTagSelfClosing(tag: string) {
        return !!tag.match(/.*\/\s*>$/)
    }

    private isTagClosing(tag: string) {
        return !!tag.match(/^<\s*\//)
    }

    private stripTag(tag: string) {
        tag = tag.trim()

        let m
        if (m = tag.match(/^<\s*\/(.*?)>$/)) {
            return m[1]
        } else if (m = tag.match(/^^<\s*([\w-]+)(.*?)\s*\/\s*>$/)) {
            return m[1]
        } else if (m = tag.match(/^<\s*([\w-]+)(.*?)>$/)) {
            return m[1]
        }
        return tag.substr(1, tag.length - 2)
    }

    private findClosingBracket(s: string, start: number, closingBracket?: string) {
        let bracket = s.substr(start, 1)
        if (!closingBracket) {
            switch (bracket) {
                case '<':
                    closingBracket = '>'
                    break
                case '(':
                    closingBracket = ')'
                    break
                case '{':
                    closingBracket = '}'
                    break
                case '[':
                    closingBracket = ']'
                    break
                default:
                    throw new Error(`Unknown opening bracket '${ bracket }'. Please provide the 'closingBracket' parameter.`)
            }
        }

        let bracketLevel = 0
        for (let i = start; i < s.length; ++i) {
            const c = s.substr(i, 1)
            if (c === bracket) bracketLevel++
            else if (c === closingBracket) bracketLevel--

            if (bracketLevel <= 0) {
                return i
            }
        }
        return -1
    }

    private findClosingString(s: string, start: number) {
        const stack: string[] = []
        for (let i = start; i < s.length; ++i) {
            const c = s.substr(i, 1)
            switch (c) {
                case '\\':
                    i++
                    break
                case '\'':
                case '"':
                case '`':
                    if (stack[stack.length - 1] === c) {
                        stack.pop()
                    } else {
                        stack.push(c)
                    }
                    break
                case '$':
                    if (stack[stack.length - 1] === '`' && s.substr(i, 2) === '${') {
                        i = this.findClosingBracket(s, i + 1)
                    }
                    break
            }
            if (stack.length < 1) {
                return i
            }
        }
        return -1
    }
}