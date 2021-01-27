---
title:Overview
multipage:true
---

# Introduction

## Build Fast, Fast.

Imba is a Web programming language that's fast in two ways: Imba's time-saving syntax with built-in tags and styles results in less typing and switching files so you can build things fast. Imba's groundbreaking memoized DOM is an order of magnitude faster than virtual DOM libraries, so you can build fast things.

In Imba DOM elements _and_ CSS are treated as first-class citizens. DOM elements are compiled to a [memoized DOM](/guides/advanced/performance), which is an [order of magnitude faster](https://somebee.github.io/dom-reconciler-bench/index.html) than today's virtual DOM implementations.

#### Imba At A Glance
- Compiles to Javascript
- Works with Javascript
- Smart, Minimal Syntax
- Built-in Tags & Styles
- Amazing Performance

## Installation

```sh
npm install -g imba@pre
git clone --bare https://github.com/imba/imba-starter-app
cd imba-starter-app
imba -w server.imba
```

## Community

#### Discord Server

For questions and support please use our community chat on
[Discord](https://discord.gg/mkcbkRw) or our [discourse](https://users.imba.io/).

#### Bi-Weekly Meeting

Everyone is welcome! The developer meetings are usually on Monday's every 2 weeks. This is a great place to report your issues, hangout and talk about your project using Imba. If you have an open pull request which has not seen attention, you can mention it during the meeting.

For the exact meeting times please use the Meetup group [Imba Oslo Meetup](https://www.meetup.com/Imba-Oslo-Meetup), this is where you can see the timezone, cancellations, etc.

You can join us remotely via [Zoom](https://us04web.zoom.us/j/230170873).

Did you miss a meeting? No worries, catch up via the [meeting notes](https://docs.google.com/document/d/1ABGjOJut9eXrajYjdN4G4-UGGU4gvKznLk5CAaXYjso/edit?usp=sharing) or [video recordings](https://www.youtube.com/playlist?list=PLf1a9PYKGPdl3OMBHV72Oz23eFy9q51jJ).


# Basic Syntax

Imba's minimal syntax makes it quick and flexible. Learn all the details in the [Language](/language/introduction) section.

## Literals

```imba
let number = 42
let bool = yes

# strings
let string = 'the answer is 42'
let dynamic = "the answer is {number}"
let template = `the answer is {number}`

# dimensions
let length = 20px
let duration = 150ms

let regex = /answer is (\d+)/
let array = [1,2,3]
let object = {name: 'Imba', type: 'language'}

# objects can also be indented
let details =
    name: "Imba"
    version: 2.0
    repository: 'https://github.com/imba/imba'
    inspiration: ['ruby','python','react','coffeescript']

# anonymous functions
let func = do(a,b) a * b

# callbacks
[1,2,3].map do(item) item * 2
```

## Variables
```imba
const name = 'imba'
let version = '2.0.0'
let [one,two,three] = [1,2,3]
let {width,height} = window.screen
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

### Inline styles

```imba
import {todos} from './data.imba'

# ---
# inline styles
<div[display:flex flex-direction:row color:blue]>
# property shorthands/aliases
<div[d:flex fld:row c:blue]>
# conditional styles based on pseudostates
<div[opacity:0.5 @hover:1]>
# conditional styles based on media queries
<div[padding:3rem @lg:5rem @print:0]>

```

### Component Styles

```imba
import {todos} from './data.imba'

tag todo-app
    css .item color:gray8 bg@hover:gray1
    css .item.done color:green8 text-decoration:line-through

    def render
        <self> for todo in todos
            <div.item .done=todo.completed> <span> todo.title
```

### Inline Selectors
```imba
import {todos} from './data.imba'

tag todo-app
    css .item color:gray8 bg@hover:gray1
    css .item.done color:green8 text-decoration:line-through

    def render
        <self>
            <div.header>
				css .tab # scoped to tags inside header
                    l:flex mx:2 py:1 c:teal6 fw:500 bb:2px solid teal6/0
					&.active c:teal7 bbc:teal6
                <a.tab @click.emit('showide')> "Try"
                <a.tab href='https://github.com/imba/imba'> "GitHub"
                <a.tab href='https://discord.gg/mkcbkRw'> "Chat"
```

### File Styles
```imba
# Styles are scoped to elements in the same file by default.
css p
    padding: 1rem 2rem
    color:blue7

<div> <p> "My blue paragraph"
```

### Global Styles

```imba
global css .button
    padding: 1rem 2rem
    color:gray7
    border: 1px solid gray2
    rd: 3px
    &.blue bg:blue5 color:white bg@hover:blue6
    &.teal bg:teal5 color:white bg@hover:teal6

<div>
    <div.button.blue> "Blue button"
    <div.button.teal> "Teal button"
```

## Comments

```imba
# This is a comment
let name = "imba" # my favorite language

###
This color is my favorite
I need several lines to really
emphasize this fact.
###

let color = "blue"
```

Single-line comments in Imba are any text following `# ` on the same line. Multi-line comments are any text in between `###` and `###`


## Type annotations

> Type annotations in Imba are compiled to jsdoc comments and are used for intelligent auto-completions and analysis in Visual Studio Code.

```imba
let item\string = window.title

def multiply a\number, b\number
    a * b
```

# Grammar

## Identifiers

In imba, identifiers are case-sensitive and can contain Unicode letters, $, _, -, and digits (0-9), but may not start with a digit. An identifier can end with `?` to make it a predicate identifier.

$0 .. $n are reserved identifiers used as shorthands for function arguments with $0 refering to the set of arguments.

Like css and html, dashes inside identifiers are perfectly valid in Imba and is often preferred for readability and that it allows to easily skip to each segment of the identifier. They are compiled to the equivalent camelCase version. 

### Global Identifiers

Identifiers starting with an uppercase letter are global-first, meaning that they will not be implicitly scoped.

> Example showing global identifiers vs local identifiers

### Symbol Identifiers [wip]

[Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) are values that programs can create and use as property keys without risking name collisions. In Imba symbol identifiers start with one or more `#` in the beginning of the identifier. So `#name` is a type of identifier representing a symbol. Symbol identifiers are not allowed as variable names, and are always scoped to the closest strong scope.

```imba
const obj = {name: 'Jane', #clearance: 'high'}
obj.name
obj.#clearance
```

### Predicate Identifiers
Imba also allows `?` at the end of identifiers for methods, properties, and variables. These are predicate identifiers  and should represent a boolean value. They are used to represent a checkable state and provides improved readability over other approaches like predicate prefixes like `isEmpty`.

```imba
tag sized-list
    prop items = []
    prop size = 10

    get empty? do
        items.length > 0

```

> Behind the scenes, a `dirty?` property will compile to `isDirty` in JavaScript.


### Using reserved keywords

Essentially all reserved keywords can still be used as properties.

```imba
a.import
a['import']
a = { import: 'test' }
```

### Identifiers with special meanings

There are a few identifiers that are reserved as keywords in certain contexts. `get`, `set` and `attr` are perfectly valid to use as variables, arguments, and properties, but in class definitions they have a special meaning.

Also, identifiers `$0`, `$1`, `$2` and so forth are not valid variables names – as they refer to the nth argument in the current function. `$0` is an alias for `arguments` from js, and refers to all the arguments passed into a function.

```imba
# $(n) is a shorter way to reference known arguments
['a','b','c','d'].map do $1.toUpperCase!
['a','b','c','d'].map do(item) item.toUpperCase!
```

```javascript
[1, 2, 3, 4];
```

## Variables

### Declaring variables

Variables are declared using `let` and `const` keywords. `let` variables can be changed through reassignment, while `const` variables are readonly after the initial declaration. Unlike javascript multiple declarations per line is not allowed.

```imba
# readonly constant
const one = 123
# single declaration
let a = 123
# array destructuring
let [e,f,...rest] = [1,2,3,4,5]
# object destructuring
let {g,h,data:i} = {g:1,h:2,data:3}
# in conditionals
if let user = array.find(do $1 isa Person)
	yes
```

#### Tip [tip]

In all the examples throughout this documentation you can hover over an identifier to highlight all references to the variable. Identifiers resolving to variables have a different color than identifiers resolving as implicit accessors of self.

## Scoping

### Lexical Scopes

`if`, `elif`, `else`, `do`, `for`,`while`,`until`,`switch`,`do` create block scopes. This means that any variable declared in the indented code inside these statements are only available within that scope.

```imba
# global scope
let x = 1
if true
	# block scope
	let y = 2
y # not a variable in scope
```

### This vs Self

If you come from js, `this` will be a well-known concept. While `this` still exists in imba, working exactly like its js counterpart, `self` is what you should use in imba. It is a very common pattern in js to need to refer to an outer scope when dealing with callbacks, event listeners and more.

```javascript
setup(){
	var self = this;
	[1,2,3].map(function(){
		self.doSomething();
	})
}
```

This is essentially what `self` does under the hood. In imba, `self` is bound do the closest _selfish_ scope. Besides the root scope of a file, only the scopes of `def`, `get` and `set` are selfish.

```imba
class Item
	def setup
		# selfish scope
		[1,2,3].map do(val)
			# selfless scope
			self # the Item
			this # the array
```

If this looks confusing, fear not – `this` is something you will practically never see or use in imba codebases.

### Implicit Self

To understand Imba, you have to understand the concept of implicit self. A lone (lowercase) identifier will always be treated as an accessor on `self` unless a variable of the same name exists in the current scope or any of the outer scopes.

```imba
const scale = 1
class Rectangle
    def check forced
        forced # found variable named arg - no implicit self
        scale # found in scope! - no implicit self
        width # no variable - equivalent to self.width
        normalize! # not found - method call on self

```

Self is also implicit when setting properties.

```imba
let changes = 0
class Line
    def expand
        changes += 1 # changes += 1
        width += 10 # self.width += 10
```

Self always refers to the closest _selfish_ scope, and lone identifiers not declared in the lexical scope are treated as properties on self. **Uppercased identifiers are not treated as accessors**. So `Array`, `Map`, or `SomeIdentifier` will always resolve the same way they do in JavaScript.

### Global variables [wip]

<!-- Mention the globals. -->

### Variable hoisting

Variables are _not_ hoisted in Imba. This means that a reference to a variable before its declaration will behave is if there is no declaration - and instead be an implicit access on self.

```imba
def method
	data # not in scope - same as self.data
	let data = {a:1,b:2}
	data # in scope
```

# Literal Types

A good way to think of Imba is, "it’s just Javascript". Imba compiles directly to readable JavaScript. This means that every native type with all of their methods, properties and behaviour are the exact same. So, strings are just strings, arrays are just arrays etc. Mozilla Developer Network is a great place to look up extensive documentation for these things.

## Strings

```imba
let single = 'single quotes'
let double = "double quotes"
let interpolation = "string has {double}"
let template = `current version is {imba.version}`
```

Imba uses `{}` for string interpolation while JavaScript uses `${}`. If you want interpolated strings with literal curly-braces, remember to escape them with `\`. Other than that, the String type is identical to String in JavaScript. See documentation at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String).

### Multiline Strings

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

### Template Strings

```imba
`string text`
# multiple lines
`string text line 1
 string text line 2`
# interpolated expression
`string text {expression} string text`
# tagged template
method`string text {expression} string text`
```

### Tagged templates [tip]

Tagged templates from JavaScript are on the roadmap, but not currently supported.

### Dimension Strings

```imba
let length = 100px
let progress = 87%
let delay = 150ms
let took = 1.4s
let dynamic = (window.innerWidth)px
```
Dimensions are numbers with a unit attached to it. They are compiled and treated as regular strings. When dealing with styles it is nice to be able to write `offset = (point.x)px` instead of `offset = "{point.x}px"`.

## Numbers

```imba
let integer = 42
let float = 42.10
let hex = 0x00
let binary = 0b0010110
```

The Number type is identical to Number in JavaScript. See documentation at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

#### Numeric Separators

You can use `_` as a separator inside numbers for improved readability.

```imba
let budget = 120_000_000
let spent = 123_150_077.59
let hex = 0xA0_B0_C0
let binary = 0b0010_1100
```

#### Numeric Constants

```imba
const biggestNum     = Number.MAX_VALUE
const smallestNum    = Number.MIN_VALUE
const infiniteNum    = Number.POSITIVE_INFINITY
const negInfiniteNum = Number.NEGATIVE_INFINITY
const notANum        = Number.NaN
```




## Arrays

##### Array Literal

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

##### Syntax

```imba
let object = {a: 'foo', b: 42, c: {}}
console.log(object.a) # => 'foo'
```

##### Dynamic keys

```imba
let field = 'age'
let person = {name: 'Bob Smith', [field]: 32, gender: 'male'}
console.log(person.age) # => 'Bob Smith'
```

##### Indented

```imba
let person =
    name: 'Bob Smith'
    age: 32
    gender: 'male'
console.log(person.name) # => 'Bob Smith'
```

##### Dot notation `.`

```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person.name
person.age = 33
```

##### Bracket notation `[]`

```imba
let person = {name: 'Bob Smith', age: 32, gender: 'male'}
# ---
person['name']
person['age'] = 33
```

##### Destructuring

```imba
let a = 'foo'
let b = 42
let c = {}
let object = {a,b,c}
console.log(object) # => {a: 'foo', b: 42 c: {}}
```

## Booleans

```imba
let bool1 = true
let bool2 = yes # alias for true
let bool3 = false
let bool4 = no # alias for false
```

## Null

```imba
let value = null
```

The value `null` represents the intentional absence of any object value. It is one of JavaScript's primitive values and is treated as falsy for boolean operations.

## Undefined

The global `undefined` property represents the primitive value `undefined`. A variable that has not been assigned a value is of type undefined

### Strict equality

Strict equality syntax in Imba is the same as in Javascript.

```imba
0 == '0'  # true
0 === '0' # false
```

## Regular Expressions

The RegExp object is used for matching text with a pattern. Read more at [MDN RegExp Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp). For an introduction to regular expressions, read the [Regular Expressions chapter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) on MDN.

##### Literal

```imba
let regex = /ab+c/i
```

##### Constructor

```imba
let regex = new RegExp('ab+c', 'i')
```

##### Multiline

```imba
let regex = ///
    ab+ # allows comments and whitespace
    c
///
```

## Ranges

Ranges are written like `[0...10]` and can be used to loop through the specified values

```imba
result = ""
for i in [1...5]
    result = "{result}, "

result # => 1, 2, 3, 4
```

## Tags

One of the most unique features of Imba is that DOM elements are true first-class citizens of the language. Read the [Rendering](/tags/basic-syntax) section to learn all about it.

```imba
let myElement = <div.foo title="Greetings"> "Hello World"
```


# Operators

## Arithmethic Operators [toc-pills]

### + [op=math]

```imba
1 + 2 # 3
```

### - [op=math]

```imba
3 - 1 # 2
```

### / [op=math]

```imba
6 / 3 # 2
```

### \* [op=math]

```imba
3 * 2 # 6
```

### % [op=math]

```imba
5 % 2 # 1
```

### \*\* [op=math]

```imba
2 ** 3 # 8
```

### - [op=math+unary]

```imba
-i # Unary negation
```

### + [op=math+unary]

```imba
+i # Unary plus
```

## Logical Operators [toc-pills]

### && [op=logical]

```imba
null && 10 # null
0 && 10 # 0
1 && 10 # 10
'' && 'str' # ''
```

The logical AND operator is true if all of its operands are true. The operator returns the value of the last truthy operand.

### and [op=logical]

```imba
null and 10 # null
1 and 10 # 10
```

Alias for `&&` operator

### || [op=logical]

```imba
null || 10 # 10
0 || 10 # 10
1 || 10 # 1
```

The logical OR operator is true if one or more of its operands is true. The operator returns the value of the first truthy operand.

### or [op=logical]

```imba
null or 10 # 10
0 or 10 # 10
1 or 10 # 1
```

Alias for `||` operator

### ?? [op=logical+existential]

```imba
null ?? 10 # 10
0 ?? 10 # 0
'' ?? 'str' # ''
```

The nullish coalescing operator `??` is a logical operator that returns its right-hand side operand when its left-hand side operand is `null` or `undefined`, and otherwise returns its left-hand side operand.

### ! [op=unary]

```imba
let a = true
!a # false
!10 # false
!0 # true
```

## Comparison Operators [toc-pills]

### == [op=compare]

```imba
x == y # Equality
```

### != [op=compare]

```imba
x != y # Inequality
```

### === [op=compare]

```imba
x === y # Strict equality
```

### is [op=compare]

```imba
x is y # Also strict equality
```

### !== [op=compare]

```imba
x !== y # Strict inequality
```

### isnt [op=compare]

```imba
x isnt y # Also strict inequality
```

### > [op=compare]

```imba
x > y # Greater than
```

### >= [op=compare]

```imba
x >= y # Greater than or equal
```

### < [op=compare]

```imba
x < y # Less than
```

### <= [op=compare]

```imba
x <= y # Less than or equal
```

### isa [op=compare+keyword+isa]

```imba
honda isa Car #
```

The `isa` operator tests whether the prototype property of a constructor appears anywhere in the prototype chain of an object. Alias for the javascript [instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) operator.

### !isa [op=compare+keyword+isa]

```imba
princess !isa Car
```

### typeof [op=unary+keyword]

```imba
typeof item
```

## Assignment Operators [op-assign] [toc-pills]

### = [op=assign]

```imba
a = b
```

### ||= [op=assign]

```imba
a ||= b # If falsy assignment
```

### &&= [op=assign]

```imba
a &&= b # If truthy assignment
```

### ??= [op=assign]

```imba
a ??= b # If null assignment
```

### += [op=math+assign]

```imba
a += b # Addition assignment
```

### -= [op=math+assign]

```imba
a -= b # Decrement assignment
```

### \*= [op=math+assign]

```imba
a *= b # Multiplication assignment
```

### /= [op=math+assign]

```imba
a /= b # Division assignment
```

### %= [op=math+assign]

```imba
a %= b # Remainder assignment
```

### \*\*= [op=math+assign]

```imba
a **= b # Exponential assignment
```

### ++ [op=math+assign+unary+post]

```imba
a++ # Increment assignment, returns original value
```

### -- [op=math+assign+unary+post]

```imba
a-- # Decrement assignment, returns original value
```

### ++ [op=math+assign+unary]

```imba
++a # Increment assignment, returns incremented value
```

### -- [op=math+assign+unary]

```imba
--a # Decrement assignment, returns decremented value
```

### =? [op=assign+change+advanced]

```imba
let object = {}
let input = 200
# ---
if object.value =? input
    yes
```

Regular assignment that returns true or false depending on whether the left-hand was changed or not. More concise way of doing. The reassignment may seem unnecessary at first, but since memoization is an oft-used pattern in Imba, this is a very convenient addition.

```imba
let object = {}
let input = 200
# ---
if object.value != input
    object.value = input
    yes
```


## Bitwise Operators [toc-pills]

### & [op=bitwise]

```imba
a & b # Bitwise AND
```

### !& [op=bitwise]

```imba
a !& b # Bitwise NOT AND
```

> Essentially the same as `(a & b) == 0`

### | [op=bitwise]

```imba
a | b # Bitwise OR
```

### ^ [op=bitwise]

```imba
a ^ b # Bitwise XOR
```

### ~ [op=bitwise+unary]

```imba
~ a # Bitwise NOT
```

### << [op=bitwise]

```imba
a << b # Left shift
```

### >> [op=bitwise]

```imba
a >> b # Sign-propagating right shift
```

### >>> [op=bitwise]

```imba
a >>> b # Zero-fill right shift
```

### <<= [op=bitwise+assign]

```imba
a <<= 1 # Left shift assignment
```

### >>= [op=bitwise+assign]

```imba
a >>= 1 # Right shift assignment
```

### >>>= [op=bitwise+assign]

```imba
a >>>= 1 # Unsigned right shift assignment
```

### &= [op=bitwise+assign]

```imba
a &= 1 # Bitwise AND assignment
```

### |= [op=bitwise+assign]

```imba
a |= 1 # Bitwise OR assignment
```

### ~= [op=bitwise+assign]

```imba
a ~= 1 # Bitwise NOT assignment (unassignment)
```

### ^= [op=bitwise+assign]

```imba
a ^= 1 # Bitwise XOR assignment
```

### |=? [op=bitwise+assign+change+advanced]

```imba
const STATES = {LOADED: 2}
let data = {state: 0}

# ---
if data.state |=? STATES.LOADED
    yes
```

Bitwise OR assignment that returns true only if the bit(s) was not previously set. Essentially a concise way to do

```imba
const STATES = {LOADED: 2}
let data = {state: 0}

# ---
if (data.state & STATES.LOADED) == 0
    data.state |= STATES.LOADED
    # do something here...
```

### ~=? [op=bitwise+assign+change+advanced]

```imba
const STATES = {LOADED: 2}
let data = {state: 0}

# ---
if data.state ~=? STATES.LOADED
    # went from loaded to not loaded
```

Bitwise unassignment that unsets the right-hand bits from left-hand value and returns true / false depending on whether this actually changed the left-side or not.

```imba
const STATES = {LOADED: 2}
let data = {state: 0}

# ---
if (data.state & STATES.LOADED) == 0
    data.state |= STATES.LOADED
    # do something here...
```

### ^=? [op=bitwise+assign+change+advanced]

```imba
a ^=? 1 # Bitwise XOR assignment
```

## Keywords [toc-pills]

### delete [op=keyword+delete+unary]

```imba
let object = {one: 1, two: 2}
delete object.one
```

### class [keyword] [wip]

### switch [keyword] [wip]

### for [keyword] [wip]

### do [keyword] [wip]

### get [keyword] [wip]

### set [keyword] [wip]

### def [keyword] [wip]

### prop [keyword] [wip]

### attr [keyword] [wip]

### tag [keyword] [wip]

### if [keyword] [wip]

### elif [keyword] [wip]

### else [keyword] [wip]

### when [keyword] [wip]

### try [keyword] [wip]

### catch [keyword] [wip]

### continue [keyword] [wip]

### break [keyword] [wip]

### return [keyword] [wip]

# Functions

When we talk about functions in Imba, we refer to anonymous / inline functions declared with the `do` keywords. See methods.

## Defining functions

```imba
# defining a function
const square = do |num| num * num

# inside an object
const util =
    upcase: do |str| str.toUpperCase!
    downcase: do |str| str.toLowerCase!
```

Function scopes are selfless, meaning that `self` inside their function bodies will refer to the closest lexical _selfish_ scope. See more about this in the section on Scoping.

### Default parameters

```imba
const multiply = do |a, b = 1|
    a * b
```

### Rest parameters

```imba
def add num, ...rest
    for item in rest
        num += item
    return num

add 1,2,3,4,5
```

### Destructuring parameters

```imba
def draw {size = 'big', coords = {x:0, y:0}, radius = 25}
	console.log size,coords,radius

draw coords:{x: 18, y:30}, radius:30
```

## Calling functions

Defining a function does not execute it. Defining it simply names the function and specifies what to do when the function is called. Accessing a function does not execute it either. If an object has a property `transform`, `object.transform` merely references that function.

When you call a function with arguments, parenthesis are optional.

```imba
# the following expressions are equivalent
console.log('hello')
console.log 'hello'
```

If you want to call a function without arguments, you have two options. Either with an empty pair of parenthesis, or with a `!`, which we call _bang invocation_ in Imba.

```imba
# the following expressions are equivalent
Math.random()
Math.random!
```

### Callbacks

Many functions expect another function as an argument. These are often referred to as callbacks. To take a classic example, `Array.map` creates a new array populated with the results of calling a provided function on every element.

Since this is a common pattern, inline anonymous functions can be passed in

```imba
[1,2,3].map do |item|
    item * 2 # [2,4,6]
```

The convention is usually to take the callback as the last argument, but not always.

```imba
setTimeout((do
    console.log 'waited!'
    [1,2,3].reduce((do |sum,value|
        sum + value
    ),0)
),1500) # looks pretty messy
```

When functions expect callbacks as their first (or not-last) argument, you can use `&` as a placeholder for the callback. The `&` is simply a reference to the callback that is supplied at the end of the invocation.

```imba
setTimeout(&,1500) do
    console.log 'waited!'
    [1,2,3].reduce(&,0) do |sum, value|
        sum + value
```

# Control Flow

## For-In Loops

For in is the basic syntax for looping through arrays and any other object that has a `length` property and allows accessing their members through `object[index]`. This includes `Array`, `NodeList`, `DOMTokenList`, `String` and more. It was created before `for of` iterables became standard in ES2015, but is still a practical alternative to using `for of` in many cases. Imba `for in` is not to be confused with `for in` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in).

```imba
for num in [1,2,3]
    num * 2
```

### Index parameter

If you include a second parameter in the source it will automatically refer to the index of the current iteration.

```imba
for num,index in [1,2,3]
    console.log num * index
# [1,4,9]
```

### Stepping with `by`

To step through an iterable in fixed-size chunks, use `by`

```imba
# go through every other element
for num in [1,2,3] by 2
    num * 2
```

### Filtering with `when`

You can include a condition using the `when` clause. This will make sure the iteration only executes for members that match said condition.

```imba
# go through every other element
for num,i in [1,2,3] when i % 2
    console.log num
```

### For-In with ranges

```imba
# from 0 up to (including) 3
for num in [0 .. 3]
    num
# [0,1,2,3]
```

```imba
# from 0 up to (excluding) 3
for num in [0 ... 3]
    num
# [0,1,2]
```

> Ranges **must include spaces** around `..` and `...`

### For-In with non-arrays

When Imba cannot infer that an object is an array during compilation it will behind the scenes look for a `toIterable` method on the object before looping. This way one can make any type of object easily support being iterated using a `for in` loop.

```imba
class LabelString
    def constructor label
        label = label

    def toIterable
        console.log 'called toIterable'
        label.split(',')

let labels = new LabelString 'idea,proposal,duplicate'

for label in labels
    console.log label.toUpperCase!
```

## For-Of Loops

The for...of statement creates a loop iterating over iterable objects, including: built-in String, Array, array-like objects (e.g., arguments or NodeList), TypedArray, Map, Set, and user-defined iterables. This maps directly to `for of` [in javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) with a few convenient additions.

### Iterating over an `Array` [preview=console]

```imba
let iterable = [10,20,30]
for value of iterable
    console.log value
```

### Iterating over a `String` [snippet] [preview=console]

```imba
let iterable = 'imba'
for value of iterable
    console.log value
```

### Iterating over a `TypedArray` [snippet] [preview=console]

```imba
let iterable = new Uint8Array([0x00,0xff])
for value of iterable
    console.log value
```

### Iterating over a `Map` [snippet] [preview=console]

```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry of iterable
    console.log entry

# destructuring
for [key,value] of iterable
    console.log value
```

### Iterating over a `Set` [snippet] [preview=console]

```imba
let iterable = new Set([1, 1, 2, 2, 3, 3])
for value of iterable
    console.log value
```

### Iterating over the arguments object [snippet] [preview=console]

```imba
def fn
    for arg of arguments
        arg * 2
console.log fn(1,2,3) # => [2,4,6]
```

### Iterating with index parameter

In Imba you can supply a second parameter to `for ... of`. This will be populated with the current iteration number (starting at 0), just like the second argument in `Array#map` and `Array#forEach`.

```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry,idx of iterable
    console.log entry,idx
for [key,value],idx of iterable
    console.log key,value,idx
```


### For-Own-Of

A pretty common need is to loop through the key-value pairs of objects. The default recommended way to do this in JavaScript is:

```javascript
let obj = { a: 1, b: 2, c: 3 };
for (const [key, value] of Object.entries(obj)) {
	console.log(`${key}: ${value}`);
}
```

Since this is a common pattern - Imba has specific support for this using `for own ... of`. This statement creates a loop iterating over key-value pairs of objects.

```imba
let obj = {a: 1, b: 2, c: 3}
for own key,value of obj
    console.log "{key} is {value}"
```

## While Loops

Executes repeatedly as long as condition is truthy.

```imba
let ary = [1,2,3]
while let item = ary.pop!
    console.log item
```

## Until Loops

Executes repeatedly **until** condition is truthy.

```imba
let ary = [1,2,3]
until ary.length == 0
    console.log ary.pop!
```

## Continue

`continue` is supported in all loop types (`for in`, `for of` and `for own of`)

```imba
let res = for num in [1,2,3,4,5]
    continue if num == 3
    num * 2
console.log res # [2,4,8,10]
```

```imba
let res = for num in [1,2,3,4,5]
    break if num == 3
    num * 2
# [2,4]
```

### Continue with value

When supplying an argument to continue, this value will be added to the resulting array, essentially like an early return would do in an `Array#map` function.

```imba
let res = for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
# continue with an argument acts like early return within Array#map
# res => [2,4,-1,8,10]
```

## Break

`break` is supported in all loop types (`for in`, `for of` and `for own of`)

```imba
let res = for num in [1,2,3,4,5]
    break if num == 3
    num * 2
# [2,4]
```

### Break with value

You can also supply an argument to break. When supplying an argument to break, this value will be added to the resulting array. This is especially useful when you want to return until some condition is met, but also want to include the item at which condition was met.

```imba
let res = for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
```

## Conditionals

### If [snippet]

The if statement executes the indented code if a specified condition is truthy.

```imba
# indented
if condition
    console.log 'yes!'
```

### Unless [snippet]

The unless statement executes the indented code if a specified condition is _not_ truthy.

```imba
unless condition
    console.log 'condition was not truthy'
```

> The unless statement executes the indented code if a specified condition is _not_ truthy.

### Else [snippet]

If the condition is falsy, code inside the connected else block will execute.

```imba
if condition
    console.log 'yes!'
else
    console.log 'no!'
```

### Chaining conditionals [snippet]

To conveniently chain multiple conditionals, use `elif`. No `elif` or `else` statements will be executed after the first truthy condition.

```imba
if expr > 10
    console.log 'over 10'
elif expr > 5
    console.log 'over 5'
elif expr
    console.log 'not falsy'
```

### Trailing condition [snippet]

If & unless can also be used at the end of a single line expression

```imba
console.log 'yes' if condition
console.log 'no' unless condition
```

### Ternary operator [snippet]

The [Ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) is a useful way to write compact if / else statements.

```imba
condition ? console.log('yes!') : console.log('no!')
```

## Switch

```imba
switch value
when 10
    yes
when 5
    no
else
    throw 'nope'
```

## Await

Imba supports the `await` keyword, which compiles directly to async/await in JavaScript. The only difference is that you do not need to mark your functions as async. Any function that contains an await will automatically be compiled to an async function.

```imba await.imba
def load url
    let res = await window.fetch url
    return res.json

let data = await load "/some/url"
```

#### Without await using promises
```imba
def load url
    window.fetch(url).then do(res)
        return res.json

load("/some/url").then do(data)
    # do something with data
```

> async/await is already supported in every major browser. If you are targeting IE11 users you need to babelify the compiled code.

## Error Handling

For error handling you can throw exceptions using the `throw` statement and handle them using the `try` and `catch` statements. Adding a `try` without a `catch` block will silently swallow the error.

```imba app.imba
def run
    # adding a try without a catch block will silently swallow an error
    let test = try Math.rEndom!
    return test # returns undefined as Math.rEndom! is not a function
console.log run!
```
> undefined

```imba parse.imba
def parse input
    try
        return JSON.parse input
    catch e
        console.error "Invalid json passed to parser: ", e.message

parse('<invalid json, error here we come!>')
```
> Invalid json passed to parser:  Unexpected token < in JSON at position 0

# Classes

Classes are general-purpose, flexible constructs that become the building blocks of your program's code. You define properties and methods to add functionality to your classes using the same syntax you use to define constants, variables, and functions. Classes in Imba are compiled directly to native [JavaScript Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).

## Defining Classes

```imba
class Rect
    # custom constructor
    constructor w,h
        width = w
        height = h

    # class method
    def expand hor,ver = hor
        width += hor
        height += ver

    # getter
    get area
        width * height

    # setter
    set area size
        width = height = Math.sqrt size
```

## Creating Instances

The `new` keyword will let you create an instance of your class. This instance inherits properties and methods from its class.

```imba
let fido = new Dog
```

## Class Constructors

Use the `constructor` keyword to declare a custom constructor method for your class. This method will be executed whenever an instance of the class is created (using the `new` keyword).

```imba
class Rect
    constructor w,h
        width = w
        height = h
    # ...
```

## Instance Methods

You can add methods to your class instances using the `def` keyword, followed by the method name and optional arguments.

```imba
class Rect
    def expand hor,ver = hor
        width += hor
        height += ver
```

## Class Fields

Instance fields exist on every created instance of a class. By declaring a field, you can ensure the field is always present, and the class definition is more self-documenting. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) for more details.

```imba
class Rect
	width = 10
	height = 10
```

> instances of Rect will always be initialized with width and height set to 10.

The scope after `=` in a class field refers to the instance itself, so class fields can also reference other properties and methods.

```imba
class Rect
	width = 10
	height = 10
	area = width * height

console.log (new Rect).area # 100
```

## Computed Properties

You can add computed properties to your class instances using the `get` keyword followed by the name of the property. The `get` syntax binds an object property to a function that will be called when that property is looked up

```imba
class Rect
    get area
        width * height
```

Using `set` you can define a function that will be called when there is an attempt to set that property.

```imba
class Rect
    set sides value
        width = value
        height = value
```

You can define setters which are to be called whenever there is an attempt to set that property.

## Lazy Getters [wip]

Any getter is bound only when first accessed. A lazy getter will in addition only determine its value the first time it is accessed and from then on return the initial value which can be memoized. This is done with a falsy assignment `||=`.

```imba
class Component
    get ref
        #ref ||= utils.uuid! # The symbol #ref is only set the first time Component.ref is accessed
```

## Computed Names

You can define methods, getters and setters with computed names using `[]`.

```imba
let method = 'items'
let getter = 'title'

class Todo
    get [getter]
        data[getter]

    def [method]
        console.log "called method {method}"

let todo = new Todo
todo.items! # called method items
todo.title
```

## Meta Properties

Upcoming versions of JavaScript has support for "private fields" using the `#` prefix for properties. Imba has a similar syntax that serves a similar purpose. See [Meta Properties]. Meta properties can be used in classes for method, fields, and other properties.

Meta properties are implemented as symbols, They do not show up on an Object using `for in`, `for of`, `Object.getOwnPropertyNames` or `Object.keys`, and they will never conflict with string-based / plain properties on your classes & instances. These are useful for a wide variety of things and are used extensively in the imba runtime itself.

### Storing values for getters and setters

You may often find yourself defining setters because you want to do something when a property is set. The problem is that a property with a setter cannot also store an actual value with the same name. The ideomatic way to store underlying values in setters is to use a meta property with the same name:

```imba
class Todo
    set title value
        # do something here
        #title = value

    get title
        #title
```

This is also useful if you want to declare memoized / lazy fields, where the value of the field should not be initialized until the first time it is accessed.

```imba
class Component
    get ref
        #ref ||= utils.uuid!
```

Let's say we want to add a `#ref` property to _all objects_ - that returns a unique id for every object. As in the example above, we only want to create the id if/when it is accessed. We don't want to pollute every object with a visible textual `ref` property that may interfere with other code and libraries, so we use a meta property for this.

```imba
const map = new WeakMap

extend class Object
    get #ref
        map.set(self,utils.uuid!) unless map.has(self)
        return map.get(self)
```

The above approach of using a WeakMap to store the actual metadata is common, and even the way Babel and other transpilers usually implement private fields today. But weakmaps are quite slow and clunky. Remember that meta properties start with one _or more_ `#` characters. The convention in Imba is to always prepend an additional `#` for each nested level of indirectness. So, instead we would extend Object like this:

```imba
extend class Object
    get #ref
        ##ref ||= utils.uuid!
```

Now you will be able to access `#ref` on _all_ objects.

```imba
const object = {}
object.#ref # '... uuid ...'
# Even built in objects now have this property
window.#ref
```

### Extending native types

You can also use meta properties for methods and class fields. Since they are not enumerable, and won't collide with native methods from JavaScript it is great if you want to extend native prototypes. Imba adds a bunch of methods to the native Node / Element classes in your browser, but to be sure that it does not interact with other libraries, these methods are implemented using meta properties.

```imba
extend class Node
    def #append node
        # setup some listeners etc
        appendChild(node)
```

In your own projects you could even add functionality to _all_ objects without worry using meta properties.

```imba
const map = new WeakMap

extend class Object
    get #ref
        map.set(self,Symbol()) unless map.has(self)
        return map.get(self)

# Now you will be able to access `.#ref` on _all_ objects,
# and get a unique symbol back every time.
const object = {}
object.#ref # Symbol()
```

### Private or not?

Unlike in js, these properties are not strictly private. You can access them from outside just like other properties. So if a class has a method called `#synchronize`, you _can_ call it from outside by `instance.#synchronize!`. At the same time, meta properties are usually used for "internals".

## Static Properties

Methods, fields and computed properties can also be defined on the class itself, as opposed to its instances, by including the `static` keyword before each declaration.

```imba
class Rect
	static size = 50
	size = 100
console.log Rect.size # 50
console.log (new Rect).size # 100
```

```imba
class Rect
	static def build side
		let item = new self
		item.width = item.height = side
		return item

Rect.build(10)
```

## Class Inheritance

An important feature of Classes is the ability to inherit from other classes. For example, an Athlete is also a person, so it makes sense to inherit the properties of a person so that if we ever update the person class, the Athlete's class will also be updated. It will also help us keep our code light.

```imba
class Animal
	constructor name
		name = name

    def move distance = 0
        console.log "Animal moved {distance} meters."

    def speak
        console.log "{name} makes a noise."

class Dog < Animal
    def speak
        console.log "{name} barks."

let dog = new Dog 'Mitzie'
dog.move 10 # Animal moved 10 meters.
dog.speak! # Mitzie barks.
```

An inherited class will inherit all methods and functionality from the parent class.

If the heritor class accesses any variables or functions on self in its constructor, the constructor must first call `super`.

```imba
class Animal
	constructor name
		name = name

class Dog < Animal
    constructor name, breed
        super # calls Animal constructor with the same arguments (name, breed).
        # super(name) # This would be an explit way to achieve the same effect
        breed = breed

let dog = new Dog 'Mitzie', 'Pug'
console.log dog.name
dog.speak! # Mitzie barks.
```

### super [keyword]

##### super

```imba
class Designer < Person
	def greet greeting
        console.log 'will greet'
		super # same as super.greet(...arguments)
```

Lone `super` is treated in a special way. It is always equivalent to calling the same method in super class, passing along the arguments from the current method.

##### super ( arguments )

```imba
class Designer < Person
	def greet greeting
		super "Hey {greeting}" # same as super.greet
```

##### super.property

```imba
class Animal
	constructor name
		name = name

    def move distance = 0
        console.log "Animal moved {distance} meters."

    def speak
        console.log "{name} makes a noise."

class Dog < Animal
    def speak
        console.log "{name} barks."

    def move distance = 0
        super.speak! # call the Animal#speak method directly!
        console.log "{name} ran {distance} meters."

let dog = new Dog 'Mitzie'
dog.move 10 # Mitzie makes a noise. Mitzie ran 10 meters.
```

# Modules

## Syntax

```imba
import defaultExport from "module-name"
import * as name from "module-name"
import { export1 } from "module-name"
import { export1 as alias1 } from "module-name"
import { export1 , export2 } from "module-name"
import { foo , bar } from "module-name/path/to/specific/un-exported/file"
import { export1 , export2 as alias2 , [...] } from "module-name"
import defaultExport, { export1 [ , [...] ] } from "module-name"
import defaultExport, * as name from "module-name"
import "module-name"
```

## Examples

### import default

```imba
import DefaultExport from './source'
```

### import members

```imba
import {capitalize,camelize} from './util'
```

### import members with alias

```imba main.imba
import {capitalize as upcase,camelize} from './util'
```
```imba util.imba
export def capitalize
    return 123

export def camelize
    return 123
```

### Import an entire module's contents

```imba main.imba
import * as utils from './util'
console.log utils.ping!, utils.pong!
```
```imba util.imba
export def ping
    return 123

export def pong
    return 123
```

### Import a single export from a module [preview=md]

```imba app.imba
import {myExport} from './util'
console.log myExport!
```
```imba util.imba
export def myExport
    return 123
```

### Importing web components [preview=md]

Web components are not explicitly imported by name. As long as the files
where your components are imported somewhere in your project they will
be available everywhere.

```imba app.imba
import './controls'

imba.mount do <div[pos:absolute inset:0 d:flex a:center j:center]>
    <my-component>
    <app-avatar>
```
```imba controls.imba
# no need to export this - it is globally available
# as long as the file is imported somewhere in your project
tag my-component
    <self[d:inline-block p:2]> "Custom component"

tag app-avatar
    <self[d:inline-block]> "Avatar"
```

### Importing a custom element [preview=md]

```imba app.imba
import {MyElement} from './element'

imba.mount do <div> <MyElement>
```
```imba element.imba
export tag MyElement
    <self[d:inline-block p:2]> "Custom element here"
```

### Importing styles [preview=md]

Global styles that you want included in your project must be imported somewhere.

```imba app.imba
import './styles'

imba.mount do <div>
    <p> "Globally styled"
```

```imba styles.imba
global css
    p color:blue5
```
