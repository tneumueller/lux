# Lux

Lux is a reactive UI framework.

## Getting started

Create a project folder, that contains a webpack setup to compile Typescript to JavaScript. Then create a `/src` folder and, in it, a `index.ts` file.
This file will be the entry point where the application will be bootstrapped. It will have the following content:

```typescript
import { LxRuntime } from '@lux'
import { AppModule } from './src/app/app.module'

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        LxRuntime.init(
            LxRuntime.bootstrap(AppModule)
        )
    }
}
```

where `AppModule` is the main module of your application. It is used to specify the root component.
Create a file `src/app/app.module.ts` with the following content:

```typescript
import { Module } from '@lux/types/module.type'
import { AppComponent } from './app.component'

@Module({
    bootstrap: AppComponent
})
export class AppModule {}
```

Create a file `/src/app/app.component.ts` with the following content:
```typescript
import { Component } from '@lux/types/component.type'

@Component({
    selector: 'app-root',
    template: `
    <div>
        <p>My first Lux application!</p>
        <p>Seconds since start: {{ this.seconds }}</p>
        <button (click)="this.reset()">Reset</button>
    </div>
`
})
export class TestComponent {
    seconds = 0

    constructor() {
        setInterval(() => {
            this.seconds++
        }, 1000)
    }

    reset() {
        this.seconds = 0
    }
}
```

Last but not least create the HTML entrypoint at `/src/app/index.html` with the following content:
```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Lux</title>
        <base href="./">

        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

        <script src="main.js"></script>
    </head>
    <body>
        <app-root></app-root>
    </body>
</html>

```

And you're good to go!

## How stuff works

### Components

Components are created by giving a class the `@Component` decorator. The decorator takes an object as parameter, which can
have the following keys:
```json
    {
        selector: string,
        template: string,
        templateUrl: string
    }
```

#### Input bindings

Components can take data input from their parent component. To mark a property as an input binding, use the `@Input` decorator:
```typescript
@Component({...})
export class UserComponent {
    @Input() name: string
}
```

An input binding can have a default value: `@Input() name = 'Noname'` and the decorator takes an object or a number as a parameter, where
you can specify more options regarding the input binding:

```typescript
@Input({ max: number }) name = 'Noname'
```

The object can have the following keys:
```json
{
    max: number // specifies the amount of new values this binding can consume. If the value of the input has been changed max times, it will not accept any more new values.
}
```

When only max should be specified, you can omit the object and directly provide the number in the rounded brackets:
```typescript
@Input({  max: 1 }) name
// is the same as
@Input(1) name
```

From the parent perspective, you can provide a value for the binding like this:
```html
<app-user [name]="this.username"></app-user>
```

#### Output bindings

Components can have output variables, which will emit new values to their parent component if something changes:

```typescript
@Component({...})
export class UserComponent {
    @Output() age: number

    setAge(a: number) {
        this.age = a
    }
}
```

The `@Output` decorator can have the same options as `@Input`. Notice, that the initial value assignment already counts
as the first of the maximum specified changes.

The other side of the show looks like this:

```html
<app-user (age)="this.age"></app-user>
```

#### Events

Components can have event emitters, which emit the same kind of events as normal HTML elements, e.g. 'click' on a button.
To define a event handler on a component, create a property with the name of your event and use the `@Event` decorator to
mark it as an event handler:

```typescript
@Component({...})
export class UserComponent {
    @Event() delete: EventEmitter

    delete() {
        this.delete.emit({...})
    }
}
```

To emit the event, simply call the `.emit()` function on the property, optionally you can provide it some data.
You can also specify the event name to differ from the property name, by providing it as a parameter for the `@Event` decorator:
```typescript
@Event('delete-item') deleteItem: EventEmitter
```

The parent side of event binding looks like this:
```html
<app-user @delete-item="onDeleteItem($event)"></app-user>
```