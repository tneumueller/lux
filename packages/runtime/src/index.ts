import { LxInstance } from '../../common/src/types/lx-instance.type'
import { Object, ObjectType } from '../../common/src/types/object.type'
import { ModuleProperties } from '../../common/src/types/module.type'
import { ComponentProperties, LxComponent } from '../../common/src/types/component.type'

export class LxRuntime {
    static init(i: LxInstance) {
        const boot = (i.rootModule.props as ModuleProperties).bootstrap as LxComponent
        const bootProp = boot.props as ComponentProperties
        const bootSel = bootProp.selector

        const appRoot = document.getElementsByTagName(bootSel)[0]
        if (!appRoot) return

        boot.bindToElement(appRoot)
    }

    static bootstrap(_c: any): LxInstance {
        const c = _c as Object

        if (!c.__lx || c.__lx.type !== ObjectType.Module) {
            throw new Error('Cannot bootstrap non-module')
        }

        return new LxInstance(c)
    }
}