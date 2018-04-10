interface Tag {
    begin: number
    end: number
    selfClosing: boolean
    closing: boolean
    content: string
}

export interface Element {
    selector: string
    begin: number
    end: number
    children: Element[]
    content?: string
    contentBindings?: ContentBinding[]
}

export interface ContentBinding {
    dynamicContent?: string
    staticContent?: string
}

export class Template {
    nodes: Element[] = []

    constructor(markup: string) {
        //console.log('new template:', markup)
        this.parse(markup.trim())
    }

    private parse(m: string) {
        let elem: Element, pos = 0
        while (elem = this.findNextElement(m, pos)) {
            this.nodes.push(elem)
            pos = elem.end
        }
        console.log(this.nodes)
        this.nodes.forEach(node => {
            this.createBindings(node)
        })
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

            console.log(node.contentBindings)

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

        const openTagEnd = this.findClosingBracket(s, start)
        let openTag = s.substr(start, openTagEnd - start + 1)
        if (this.isTagClosing(openTag)) return null

        // console.log('open', openTag)

        if (this.isTagSelfClosing(openTag)) {
            //console.log('self-close', openTag)
            return {
                begin: start,
                end: openTagEnd + 1,
                children: [],
                selector: this.stripTag(openTag)
            }
        } else {
            openTag = this.stripTag(openTag)

            const nextTag = this.findNextTag(s, openTagEnd + 1)
            if (!nextTag) return null
            if (nextTag.closing) {
                if (nextTag.content !== openTag) {
                    throw new Error(`Unexpected closing tag <${ nextTag.content }>`)
                }

                // console.log('close', nextTag.content)
                return {
                    begin: start,
                    end: nextTag.end + 1,
                    children: [],
                    selector: openTag,
                    content: s.substr(openTagEnd + 1, nextTag.begin - (openTagEnd + 1))
                }
            }

            const children: Element[] = []
            let pos = openTagEnd
            let end = -1

            while (true) {
                const e = this.findNextElement(s, pos)

                // console.log(`element:`, e)

                if (!e) {
                    // two possibilities: end of the string or closing tag of this element
                    const nextTag = this.findNextTag(s, pos)

                    if (nextTag && nextTag.closing) {
                        if (nextTag.content !== openTag) {
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
                selector: openTag
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
                return {
                    begin: i,
                    end,
                    selfClosing: this.isTagSelfClosing(tag),
                    closing: this.isTagClosing(tag),
                    content: this.stripTag(tag.trim()).trim()
                }
            }
        }
        return null
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
}