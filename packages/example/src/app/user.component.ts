import { Component } from '../../../common/src/types/component.type'
import { Input } from '../../../common/src/types/input.type'

@Component({
    selector: 'app-user',
    template: `
    <p>{{ this.vorname }}</p>
    <p>{{ this.nachname }}</p>
    <p>{{ this.alter }}</p>
`
})
export class UserComponent {
    @Input() vorname: string
    @Input() nachname: string
    @Input() alter = 10

    constructor() {
        console.log('usercomponent constructor')
        setInterval(() => this.alter++, 1000)
    }
}