# global css

Style blocks are by default scoped to the file in which they are defined. This means that you can declare styles like this in your file without having to worry about affecting styles in other parts of your application. If you prefix your css declaration with the `global` keyword - the styles will be included globally

### Importing styles [preview=md]
```imba app.imba
import './styles'

imba.mount do <div>
    <h1> "Globally styled"
    <p> "Not globally styled"
```
```imba styles.imba
global css
    h1 color:blue5

css
    # these only apply to elements in styles.imba
    p color:blue6
```