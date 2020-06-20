# Modules

In this section we will be looking closer at how you can use existing code in your Imba projects. We will cover the `import` and `export` keywords. While it will beneficial for you to know about ESM and how it works in [Node.js](https://nodejs.org/api/esm.html#esm_ecmascript_modules) and the behavior of [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) and [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) in the browser. This page only focuses on the Imba specific bits you need to know and how to use them effectively.

This part of the documentation is intentionally terse, please see the guide for more in-depth descriptions.

## Importing Imba Code

The `import` keyword works mostly the same but there are a few different usages worth nothing. In contrary to ESM imports for Imba files, you don't have the file suffix `.imba` at the end. *Always import Imba code without the file suffix*.

### Importing Tags

When you are importing your own tags it suffices to specify the filename without the extension

```imba
import './my-component'
```

That will make the component available and you can start using your component.

## Individual Imports

In the examples below we are using a class inside of `MyClass.imba` but this works for variables, methods and static methods alike.

```imba
class MyClass
[...]
```

To be able to access my class outside you need to change it to be exported. 

```imba
export class MyClass
[...]
```

This will then allow you to import it 

```imba
import { MyClass } from './MyClass'
```

## Default Export

If you prefer importing without the curly braces, you need to make the export use the default property

```imba
export default class MyClass
[...]
```

Then you can

```imba
import MyClass from './MyClass'
```

## Using packages from NPM

Using packages you have installed is very straightforward. In the below example it's assumed `cowsay` has been installed

```html
yarn add cowsay # npm install cowsay
```

```imba
import cowsay from 'cowsay'

console.log(cowsay.say({text: 'imba is awesome'}))

### Output
< imba is awesome >
 -----------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
###
```

## Import Aliases

If you are not happy with the default exported name you can override it with your own using the 

```imba
import * as MyClassAlias from './MyClass'
```

That will put everything exported into MyClassAlias. 

Note that if you have a `default` export then you will need to access the default property `.default`. So creating a instance of `MyClassAlias` would look like

```imba
let instance = MyClassAlias.default.new()
```