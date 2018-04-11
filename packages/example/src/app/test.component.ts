import { Component } from '../../../common/src/types/component.type'

@Component({
    selector: 'app-test',
    template: `
    <div>
        <p>Test:</p>
        <div>
            <p>Hallo, mein Name ist {{this.vorname}} {{ this.nachname}} und ich bin {{this.alter }} jahre alt.</p>
        </div>
    </div>
    <div>
        <p>Hallo</p>
        <img src="http://www.horizont.net/news/media/15/Das-neue-Google-Logo-141300.jpeg" />
    </div>
`
})
export class TestComponent {
    vorname = 'Thomas'
    nachname = 'Neumüller'
    alter = 1

    constructor() {
        setInterval(() => {
            this.alter++
        }, 2000)
    }
}