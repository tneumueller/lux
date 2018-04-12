import { Component } from '../../../common/src/types/component.type'
import { Input } from '../../../common/src/types/input.type'
import { Output } from '../../../common/src/types/output.type'
import { Event } from '../../../common/src/types/event.type'

@Component({
    selector: 'app-user',
    template: `
    <p>{{ this.vorname }}</p>
    <p>{{ this.nachname }}</p>
    <p>{{ this.alter }}</p>
    <button @click="this.setFirstname()">set firstname</button>
`
})
export class UserComponent {
    @Input() vorname: string
    @Input(1) nachname: string
    @Input() alter = 10
    @Output() clickCount = 0
    @Event() testEvent

    constructor() {
    }

    setFirstname() {
        this.clickCount++
        this.testEvent.emit('lalala')
    }
}