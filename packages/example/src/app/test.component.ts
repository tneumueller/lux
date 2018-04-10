import { Component } from '../../../common/src/types/component.type'

@Component({
    selector: 'app-test',
    template: `
    <div>
        <p>Test:</p>
        <div>
            <p>Hallo, mein Name ist {{vorname}} {{ nachname}} und ich bin {{alter }} jahre alt.</p>
        </div>
    </div>
    <div>
        <p>Hallo</p>
        <img src="bla" />
    </div>
`
})
export class TestComponent {
}