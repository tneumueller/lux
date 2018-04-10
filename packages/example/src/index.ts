import { AppModule } from './app/app.module'
import { LxRuntime } from '../../runtime/src'

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        LxRuntime.init(
            LxRuntime.bootstrap(AppModule)
        )
    }
}