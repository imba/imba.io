# Basic Syntax

**The Imba course launched! Learn Imba through fully interactive screencasts:** <https://scrimba.com/learn/imba>

A good way to think of Imba is, "it’s just JavaScript". Imba compiles directly to readable JavaScript. This means that every native type with all of their methods, properties and behaviour are the exact same. So, strings are just strings, arrays are just arrays, and so on.

## Literals

[Watch the interactive tutorial on syntax in the Imba course!](https://scrimba.com/learn/imba/intro-to-imba-syntax-cpwyK7Tz)

Imba syntax is familiar and often the same as JavaScript. Let's look at some examples of [literals](https://developer.mozilla.org/en-US/docs/Glossary/Literal). The comments below highlight  how Imba can be both easier to read and faster to write.

```imba
const number = 42
const string = "the answer is 42"
const alsoString = "the answer is {number}" # No need for backtick strings or ${}.
const regex = /answer is (\d+)/
const array = [1, 2, 3]
const bool = true
const alsoBool = yes # You can write booleans as yes and no.
const object = { name: 'Imba', type: 'language' }
const alsoObject = name: 'Imba', type: 'language' # You can skip the curly braces.
const indentedObject = # For indented objects, you can skip the commas.
    name: 'Imba'
    version: 2.0
    repository: 'https://github.com/imba/imba'
    inspiration: ['ruby', 'python', 'react', 'coffeescript']
```

## Imba literal types

The following types do not exist in JavaScript, and are a vital part of making Imba fast and easy to use.

```imba
const duration = 150ms
const longerDuration = 42s
const element = <div.large.header> "Welcome"
const alsoElement = <div.{object.name}> "{object.name} class" # Easy interpolation, using the object above.
```


## Functions

_Note: Differences between functions and arrow functions are covered in the [functions overview](/docs/functions)._

[Watch the interactive tutorial on functions in the Imba course!](https://scrimba.com/learn/imba/functions-cJLGEQCB)


Imba uses the shorter `def` instead of the `function` keyword. `do` instead of `() => {}`. These are faster to write, read, and recognize at a glance.

```imba
def func(a, b)
    return a * b

def alsoFunc(a, b)
    a * b # Implicit return

const smallerFunc = do(a, b) a * b # Implicit return on one line
```


## Strings

```imba
const single = 'single quotes'
const double = "double quotes"
const interpolation = "string has {double}"
const template = `current version is {indentedObject.version}` # Interpolating using the object above.
```

Imba uses `{}` for string interpolation while JavaScript uses `${}`. If you want interpolated strings with literal curly-braces, remember to escape them with `\`. Other than that, the String type is identical to String in JavaScript. See documentation at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String).

Regular string literals can be written over multiple lines, but line breaks are ignored.

```imba
# [preview=console]
const multipleLines = 'one
two three'
console.log multipleLines
```

If you need a string that spans several lines and includes line breaks, use a sequence of characters surrounded by `'''` or `"""`.

```imba
# [preview=console]
const lineBreaks = '''
This string is written
over multiple lines
'''
console.log lineBreaks
```

Multiline strings preserves indentation, but only relative to the least indented line.

```imba
const stringIndentation = '''
    First level is ignored
        This is indented
    Not indented
    '''
```

Tagged templates let you parse template literals with a function in the same way [JavaScript does](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

```imba
# [preview=console]
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

console.log output
```

## Arrays

Arrays work the same way as in JavaScript. In Imba you can also declare them over multiple lines, where the value of each line represents an entry in the array. Commas are optional when array elements are separated by line breaks.

```imba
# [preview=console]
const withCommas = [
    'one',
    'two',
    'three',
    'four',
]

const withoutCommas = [
    'one'
    'two'
    'three'
    'four'
]

console.log withCommas, withoutCommas
```

## Objects

Objects work the same way as in JavaScript. As with the arrays above, commas are optional when separated by line breaks. Curly braces are optional when the separating colon makes it clear what the keys and values are.

```imba
# [preview=console]
const object = { a: 'foo', b: 42, c: {} }
const person =
    name: 'Bob Smith'
    age: 32
    gender: 'male'

# Curly braces are optional as the keys and values are clear:
def logObject(object)
    console.log "Logging:", object

logObject(name: 'Rincewind', profession: 'Wizzard')
```

An array of objects can be separated with dashes:
```imba
# [preview=console]
let todos = [
	title:'one'
	completed:yes
	-
	title:'two'
	completed:no
]
console.log todos
```

Object properties can be set dynamically by wrapping a variable with `[]`.

```imba
# [preview=console]
const field = 'age'
const person = { name: 'Bob Smith', [field]: 32, gender: 'male' }
console.log person.age
```

Properties work the same way as in JavaScript. They can be accessed and assigned using the `.` operator. The `const` keyword prevents re-assignment, but internals can still be modified.

```imba
# [preview=console]
const person = { name: 'Bob Smith', age: 32, gender: 'male' }
person.name
person.age = 33
console.log person.age
```

Keys work the same way as in JavaScript.

```imba
# [preview=console]
const person = { name: 'Bob Smith', age: 32, gender: 'male' }
person['name']
person['age'] = 33
console.log person.age
```

Destructuring (as defined in ES6) works the same way as in JavaScript.

_Note: Destructuring and skipping curly braces can get confusing. It is not recommended to combine these two features, as it makes the code hard to understand, and easy to cause bugs._

```imba
# [preview=console]
const a = 'foo'
const b = 42
const c = {}
const object = { a, b, c }
console.log object
```


## Methods

Parenthesis can be skipped, even when setting default values.

```imba
# [preview=console]
def withArgument param
	console.log param
withArgument(42)

def withDefaultValue name = 'Imba'
	console.log name
withDefaultValue()
```

Objects can be deconstructed like normal, and given default values.

```imba
# [preview=console]
def method name, { title, desc = 'no description' }
	console.log name, title, desc

console.log method('Rincewind', title: 'Wizzard')
```

## Classes

_Note: More details about classes are in the [class overview](/docs/classes)._

[Watch the interactive tutorial on classes in the Imba course!](https://scrimba.com/learn/imba/classes-cbVveMS4)

Classes in Imba can do the same things as classes in JavaScript, but have several additional features making them easier to use. 

```imba
# [preview=console]
class Todo
	# Properties are member variables:
	prop title
	prop completed = no
	prop due = null

	# Methods are instance level functions:
	def complete
		completed = yes

	# Getters:
	get overdue
		due and due < new Date


	# Static methods are class level functions:
	static def createTodos titles
		titles.map do(title)
			new Todo(title: title)


const todo = new Todo title: 'Read introduction'

console.log todo
```

Instance level methods are called on the object made from the class.

```imba
# [preview=console]
class Todo
	prop title
	prop completed = no
	prop due = null
	def complete
		completed = yes
	get overdue
		due and due < new Date
	static def createTodos titles
		titles.map do(title)
			new Todo(title: title)
# ---
const myTodo = new Todo title: 'Learn Imba'
myTodo.complete()
console.log myTodo
```

Class level methods are called directly on the class.

```imba
# [preview=console]
class Todo
	prop title
	prop completed = no
	prop due = null
	def complete
		completed = yes
	get overdue
		due and due < new Date
	static def createTodos titles
		titles.map do(title)
			new Todo(title: title)
# ---
const newTodos = Todo.createTodos ['Learn Imba', 'Eat breakfast']
console.log newTodos
```

## Loops & Iteration

[Watch the interactive tutorial on loops in the Imba course!](https://scrimba.com/learn/imba/loops-co2eb439ab71581a6ad3f0ea1)

Loops in Imba have more useful features than in JavaScript, making it easier to loop over object properties.

[Iterables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) can be looped over with `for ... of ...`.

```imba
# [preview=console]
class Todo
	prop title
	prop completed = no
	prop due = null
	def complete
		completed = yes
	get overdue
		due and due < new Date
	static def createTodos titles
		titles.map do(title)
			new Todo(title: title)
const newTodos = Todo.createTodos ['Learn Imba', 'Eat breakfast']
console.log newTodos
# ---
for todo, index of newTodos
    console.log "{todo.title} at position {index}"
```

To loop over keys and values in an object automatically, use the `own` keyword for the object.

```imba
# [preview=console]
const object =
    hello: 'world'
    learning: 'imba'
    answer: 42

for own key, value of object
    console.log "{key}: {value}"
```

Looping within tags works the same way.

[Watch the interactive tutorial on looping within tags in the Imba course!](https://scrimba.com/learn/imba/loops-inside-tags-co59443e78abc774ac34f72f4)

## Regular Expressions

Regular expressions work as in JavaScript, with the additional benefit of whitespace and comments in multi line regexes.

```imba
const literal = /ab+c/i
const regex = new RegExp('ab+c', 'i')
const multiline = ///
    ab+ # allows comments and whitespace
    c
///
```

## Ranges

Ranges use three dots within brackets `[0 ... 10]`, counting up until the upper number. This makes it easy to use with `myArray.length` without having to write `myArray.length - 1`.

```imba
# [preview=console]
const items = []
for i in [1 ... 5]
    items.push(i)

console.log items
```

## Elements

The web is native to Imba, so elements are "first class citizens" just like other native types.

```imba
# [preview]
global css ul inset:0 d:flex fld:column ja:center
# ---
const list = <ul title="reminders">
    <li> "Remember milk"
    <li> "Greet visitor"
imba.mount list
```

CSS classes are set with dots,
and can be both dynamically interpolated and conditionally set.
This lets you use logic inside elements,
keeping the code short and simple.

```imba
const state = 'open'
const condition = no

<div.panel.large> "With classes"
<div.state-{state}> "Dynamic class name"
<div.hidden=condition> "Conditionally hidden"
<div.panel.state-{state} .hidden=condition> "Dynamic and conditional"
```

Handlers work the same way.

```imba
# [preview]
global css .panel inset:0 d:flex ja:center
	cursor:pointer user-select:none
# ---
const handler = do(event)
    console.log "Panel clicked!"

imba.mount <div.panel @click.prevent=handler> "Panel"
```

## Components

[Watch the interactive tutorial on tags in the Imba course!](https://scrimba.com/learn/imba/tags-co83d4e259d958441d6c9b8e7)

Tags are compiled down to _extremely optimized_ native [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). By default, `data` is the name used to pass values into a tag. Using `data` is simple, but declaring each prop and its type is usually better. 

```imba
# Importing a todos array from another Imba file called "data.imba":
import { todos } from './data'

# Declaring a web component without specifying props:
tag todo-item
    <self .completed=data.completed>
        <input bind=data.completed type='checkbox'>
        <span.title> data.title
        <button @click.stop.emit('remove')> 'x'

# Using the todo-item inside another web component:
tag todo-app
    <self> for todo in todos
        <todo-item data=todo>

# Rendering the todo-app with the imported todos array:
imba.mount <todo-app data=todos>
```

## Styles

[Watch the interactive tutorial on inline styles in the Imba course!](https://scrimba.com/learn/imba/inline-styles-coe2d48f9a05c7b17e6fb46f7)

In normal HTML you can set inline styles on an element with `style="display: flex;"`. Using classes is often recommended, as keeping track of these inline styles can be slow, brittle, and difficult to work with.

In Imba, inline styles are much more powerful. Keeping elements, styles and logic close together can often be simpler, faster to write, and easier to read.

```imba
<div[display:flex flex-direction:row color:blue]>
<div[opacity:0.5 @hover:1]> # Conditional styles based on pseudostates.
<div[padding:3rem @lg:5rem @print:0]> # Conditional styles based on media queries.
```

### Shorthands

[Watch the interactive tutorial on shorthands in the Imba course!](https://scrimba.com/learn/imba/style-property-shorthands-co55547d5954f4b8576d0f730)

Single letter variable names are often considered to be an anti-pattern. Seeing the name `c`, what does it mean? `columns`? `content`? `color`? Reading code with unclear naming costs time and effort.

`c` is shorthand for `color`. But will that always be the case? Could it ever change, and mean `columns` or `content` instead?

```imba
<div[c:blue]>
```

**CSS keywords don't change. Imba shorthands don't change.**

Stability and consistency builds trust. Let's learn one more: `bg` is shorthand for `background`. Knowing both `bg` and `c`, what does the shorthand `bgc` "look like"? `background-color`!

Imba shorthands are bound directly to CSS, and remain stable. This makes Imba shorthands quick to read, write, and understand at a glance. `d` will always mean `display`, `p` will always mean `padding`, `m` will always mean `margin`, and so on.

```imba
<div[display:flex flex-direction:row color:blue]> # Regular keywords
<div[d:flex fld:row c:blue]> # Shorthand keywords
```

Imba developers often say these shorthand names become as familiar and natural as CSS itself, but faster. The Imba tooling gives you the full keyword on hover, and will even suggest the shorthand if you hover the regular CSS keyword.

### Scoping styles


[Watch the interactive tutorial on scoping styles in the Imba course!](https://scrimba.com/learn/imba/scoped-styles-co50f4384944f5102c6e6d8ca)

Inline styles apply to the element itself, and everything within it. Changing the scope lets you apply styles to subtrees, components, tags, the entire file, or even globally.

```imba
# Set `global` at the top level to style all <p> elements.
global css p fs:15px

# Set at the top level to style every <p> element in the file.
css p color:blue7 fw:500 

tag todo-app
    # Set at the todo-app level to style everything within the tag.
    css .item color:gray8 bg@hover:gray1
    css .item.done color:green8 text-decoration:line-through

    <self> for todo in todos
        <div.item .done=todo.completed> <span> todo.title
```

Styling can also be nested inside tag trees, and be conditionally included.

```imba
tag todo-app
    <self>
        if user.loggedIn # Styling can be conditional.
            css .header bg:green2

        <div.header>
            css .tab # Scoped to the <div.header> only.
                l:flex mx:2 py:1 fw:500
                c:teal6 @hover:teal7 @active:teal9
            <a.tab href='https://github.com/imba/imba'> "GitHub"
            <a.tab href='https://discord.gg/mkcbkRw'> "Chat"

        <div.footer>
            # Not in the <div.header> scope, so the .tab styling is not applied.
            <a.tab href='https://github.com/imba/imba.io'> "Documentation"
```

## Comments

Single-line comments in Imba are any text following `# ` on the same line. The space is required.

```imba
# This is a comment
const name = "imba" # my favorite language
```

Multiline comments are opened and closed with `###`.

```imba
###
This color is my favorite
I need several lines to really
emphasize this fact.
###
const color = "blue"
```

## Types

Type annotations in Imba are compiled to [JSDoc](https://jsdoc.app) comments and are used for intelligent auto-completions and analysis in [Visual Studio Code](https://code.visualstudio.com/).

```imba
const item\string = window.title
```

Annotations are extra useful to create "contracts" between parts of your code. It is faster to understand and re-use tags when their props are annotated, for example.

Annotating is inferred automatically when the value is assigned during declaration.

```imba
def multiply a\number, b\number
    a * b

# Rewriting the todo-tag with annotated props makes it easier to understand and use.
tag todo-item
    prop completed = no
    prop title\string

    <self .completed=completed>
        <input bind=completed type='checkbox'>
        <span.title> title
        <button @click.stop.emit('remove')> 'x'
```

Types can also be imported from other `.imba`,`.js`,`.ts`, and `.d.ts` files, if you only want to annotate your code. If we need the actual User class, for example to create a new user with `user = new User()`, then we would need to do a regular import.

```imba
# Only the type is imported:
import type { User } from './models'

tag user-card
    # The User is annotated here, so we only need the type:
    prop user\User

    <self>
        # We know what kind of object a User is now:
        <p> user.name
        <img src=user.profile alt="Profile picture"> 
```
