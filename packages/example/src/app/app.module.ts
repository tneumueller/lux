import { Module } from '../../../common/src/types/module.type'
import { TestComponent } from './test.component'
import { UserComponent } from './user.component'

@Module({
    declarations: [UserComponent],
    bootstrap: TestComponent
})
export class AppModule {}