# Basic Syntax

A good way to think of Imba is, "it’s just Javascript". Imba compiles directly to readable JavaScript. This means that every native type with all of their methods, properties and behaviour are the exact same. So, strings are just strings, arrays are just arrays etc.

## Literals

```imba
let number = 42
let duration = 150ms
let bool = yes
let string = "the answer is {number}"
let regex = /answer is (\d+)/
let array = [1,2,3]
let element = <div.large.header> "Welcome"
let object = {name: 'Imba', type: 'language'}
let func = do(a,b) a * b

# objects can also be indented
let details =
    name: "Imba"
    version: 2.0
    repository: 'https://github.com/imba/imba'
    inspiration: ['ruby','python','react','coffeescript']
```

## Strings

```imba
let single = 'single quotes'
let double = "double quotes"
let interpolation = "string has {double}"
let template = `current version is {imba.version}`
```

Imba uses `{}` for string interpolation while JavaScript uses `${}`. If you want interpolated strings with literal curly-braces, remember to escape them with `\`. Other than that, the String type is identical to String in JavaScript. See documentation at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String).

Regular string literals can be written over multiple lines, but line breaks are ignored.

```imba
let string = 'one
two three'
# => 'onetwo three'
```

If you need a string that spans several lines and includes line breaks, use a sequence of characters surrounded by `'''` or `"""`

```imba
let string = '''
This string is written
over multiple lines
'''
# => 'This string\nis written over\nmultiple lines'
```

Multiline strings preserves indentation, but only relative to the least indented line:

```imba
let string = '''
    First level is ignored
        This is indented
    Not indented
    '''
```

Tagged templates let you parse template literals with a function:

```imba
const person = 'Mike'
const age = 28

def myTag(strings, personExp, ageExp)
    const str0 = strings[0] # "That "
    const str1 = strings[1] # " is a "
    const str2 = strings[2] # "."

    const ageStr = (ageExp > 99) ? 'centenarian' : 'youngster'

    # We can even return a string built using a template literal
    "{str0}{personExp}{str1}{ageStr}{str2}"

const output = myTag`That {person} is a {age}.`

console.log(output)
# That Mike is a youngster.
```

## Arrays

```imba
[1, 2, 3, 4]
```

Arrays can also be declared over multiple lines, where the value of each line represents an entry in the array. Commas are optional when array elements are separated by line breaks.

```imba
const array = [
    'one'
    'two'
    'three'
    'four'
]
```

## Objects

```imba
let object = {a: 'foo', b: 42, c: {}}
```
Objects can also be declared using indentation:
```imba
let person =
    name: 'Bob Smith'
    age: 32
    gender: 'male'
```


Set dynamic keys using `[]`
```imba
let field = 'age'
let person = {name: 'Bob Smith', [field]: 32, gender: 'male'}
console.log(person.age) # => 32
```

Properties can be accessed and assigned using the `.` operator

```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person.name
person.age = 33
```

Or with brackets for dynamic lookups

```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person['name']
person['age'] = 33
```
Destructuring as defined in ES6 is also supported in Imba
```imba
let a = 'foo'
let b = 42
let c = {}
let object = {a,b,c}
console.log(object) # => {a: 'foo', b: 42 c: {}}
```


## Methods

```imba
def method param
    console.log param
# default values
def method name = 'imba'
    console.log param
# destructuring parameters
def method name, {title, desc = 'no description'}
    console.log name,title,desc
```

## Classes

```imba
class Todo
    # properties
    prop title
    prop completed = no
    prop due = null

    # methods
    def complete
        completed = yes

    # getters
    get overdue
        due and due < new Date

let todo = new Todo title: 'Read introduction'
```

## Loops & Iteration

```imba
# looping over iterables
for member,index of iterable
    member.name

# looping over Object.keys/values pairs
for own key,value of object
    [key,value]

# fast looping over arrays
for member,index in array
    member
```

## Regular Expressions
```imba
let literal = /ab+c/i
let regex = new RegExp('ab+c', 'i')
let multiline = ///
    ab+ # allows comments and whitespace
    c
///
```

## Ranges

Ranges are written like `[0 ... 10]` and can be used to loop through the specified values

```imba
let items = []
for i in [1 ... 5]
    items.push(i)

items # => [1, 2, 3, 4]
```

## Elements

Elements are a native part of Imba just like strings, numbers, and other types.

```imba
# elements are first class citizens
const list = <ul title="reminders">
    <li> "Remember milk"
    <li> "Greet visitor"

# setting classes on elements:
<div.panel.large> "Hello world"
# setting dynamic and conditional classes:
<div.panel.state-{state} .hidden=condition> "Panel"
# binding handlers (with modifiers):
<div.panel @click.prevent=handler> "Panel"
```

## Components

Tags are compiled down to _extremely optimized_ native web components.

```imba
import {todos} from './data.imba'

# ---
# Define custom reusable web components
tag todo-item
    <self .completed=data.completed>
        <input bind=data.completed type='checkbox'>
        <span.title> data.title
        <button @click.stop.emit('remove')> 'x'

tag todo-app
    <self> for todo in todos
        <todo-item data=todo>

imba.mount <todo-app data=todos>
```

## Styles

With the css shorthands and modifiers it is easy to use inline styles even for complex components.

```imba
import {todos} from './data.imba'

# ---
# inline styles
<div[display:flex flex-direction:row color:blue]>
# property shorthands/aliases
<div[d:flex fld:row c:blue5]>
# conditional styles based on pseudostates
<div[opacity:0.5 @hover:1]>
# conditional styles based on media queries
<div[padding:3rem @lg:5rem @print:0]>
```

Styles can be global or scoped to a file / component / tag subtree
```imba
# Applies to all <p> elements in project
global css p fs:15px
# Applies to <p> elements inside this file
css p color:blue7 fw:500
```
Define css blocks inside tag declarations to apply styles scoped to elements.
```imba
tag todo-app
    css .item color:gray8 bg@hover:gray1
    css .item.done color:green8 text-decoration:line-through

    <self> for todo in todos
        <div.item .done=todo.completed> <span> todo.title
```
Selector can also be nested inside tag trees, and be included only when certain conditions are true.
```imba
tag todo-app
    <self>
        if user.loggedIn # conditional css
            css .header bg:green2
        <div.header>
            css .tab # scoped to tags inside header
                l:flex mx:2 py:1 fw:500
                c:teal6 @hover:teal7 @active:teal9
            <a.tab href='https://github.com/imba/imba'> "GitHub"
            <a.tab href='https://discord.gg/mkcbkRw'> "Chat"
```

## Comments

Single-line comments in Imba are any text following `# ` on the same line.

```imba
# This is a comment
let name = "imba" # my favorite language
```
Multiline comments are opened and closed with `###`
```imba
###
This color is my favorite
I need several lines to really
emphasize this fact.
###
let color = "blue"
```

## Types

Type annotations in Imba are compiled to jsdoc comments and are used for intelligent auto-completions and analysis in Visual Studio Code.

```imba
let item\string = window.title

def multiply a\number, b\number
    a * b
```

Types can also be imported from other `.imba`,`.js`,`.ts`, and `.d.ts` files
```imba
import type {Resource,User} from './models'

class State
    items\Resource[]
    currentUser\User
```