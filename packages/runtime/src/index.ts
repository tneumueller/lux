import { LxInstance } from '../../common/src/types/lx-instance.type'
import { LxObjectPrototype, ObjectType } from '../../common/src/types/object.type'
import { ModuleProperties } from '../../common/src/types/module.type'
import { ComponentProperties, LxComponent } from '../../common/src/types/component.type'

export class LxRuntime {
    static init(i: LxInstance) {
        const boot = new ((i.rootModule.prototype.__lx.props as ModuleProperties).bootstrap) as LxComponent
        const bootProp = boot.__lx.props as ComponentProperties
        const bootSel = bootProp.selector

        const appRoot = document.getElementsByTagName(bootSel)[0]
        if (!appRoot) return

        boot.bindAll(boot)
        boot.bindToElement(appRoot)
        boot.init(boot)
        boot.render()
    }

    static bootstrap(_c: any): LxInstance {
        const c = _c as LxObjectPrototype

        if (!c.prototype.__lx || c.prototype.__lx.type !== ObjectType.Module) {
            throw new Error('Cannot bootstrap non-module')
        }

        return new LxInstance(c)
    }
}