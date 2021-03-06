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
        <img src="http://www.horizont.net/news/media/15/Das-neue-Google-Logo-141300.jpeg" width="50" [height]="this.height" @click="this.reset($event)" />
    </div>
    <app-user [vorname]="'Thomas'" [nachname]="this.alter" (clickCount)="this.alter" @testEvent="this.testEvent($event)"></app-user>
`
})
export class TestComponent {
    vorname = 'Thomas'
    nachname = 'Neumüller'
    alter = 1

    constructor() {
    }

    get height() {
        return this.alter * 20
    }

    reset(e) {
        this.alter = 1
    }

    testEvent(e) {
        console.log('testEvent received with data', e)
    }
}