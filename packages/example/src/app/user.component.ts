import { Component } from '../../../common/src/types/component.type'

@Component({
    selector: 'app-user',
    template: `
    <p>{{ this.vorname }}</p>
    <p>{{ this.nachname }}</p>
`
})
export class UserComponent {
    vorname = 'Thomas'
    nachname = 'Neumüller'

    constructor() {
    }
}