import { Module } from '../../../common/src/types/module.type'
import { TestComponent } from './test.component'

@Module({
    declarations: [],
    bootstrap: TestComponent
})
export class AppModule {}