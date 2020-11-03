# Introduction

## What is Imba?

## Why Imba?


# Basic Types

## Strings

## Numbers

## Arrays

## Objects

## Booleans

## Null & Undefined

## Regular Expressions

## Ranges

# Keywords

# Identifiers

## Names vs Identifiers

When we talk about identifiers, or sometimes "lone identifiers" we mean identifiers that 

## Basic Identifiers

The convention in Imba is actually to seu

## Kebab-case Identifiers

Like css and html, dashes inside identifiers are perfectly valid in Imba. Variables and properties can also end with a `?`

## PascalCased Identifiers

Identifiers starting with an uppercase letter is treated somewhat differently than other identiers

## Predicate Identifiers

## Symbol Identifiers

Symbol identifiers start with one or more `#` in the beginning of the identifier. So `#name` is a type of identifier representing a symbol. Symbol identifiers are not allowed as variable names, and are always scoped to the closest strong scope.

```imba
const obj = {name: 'Jane', #clearance: 'high'}
obj.name
obj.#clearance
```
Lone symbol identi

## Using reserved keywords

Essentially all reserved keywords can still be used as properties.
```imba
a.import
a['import']
a = { import: 'test' }
```

## Identifiers with special meanings

There are a few identifiers that are reserved as keywords in certain contexts. `get`, `set` and `attr` are perfectly valid to use as variables, arguments, and properties, but in class definitions they have a special meaning.

Also, identifiers `$0`, `$1`, `$2` and so forth are not valid variables names – as they refer to the nth argument in the current function. `$0` is an alias for `arguments` from js, and refers to all the arguments passed into a function.

```imba
# $(n) is a shorter way to reference known arguments
['a','b','c','d'].map do $1.toUpperCase!
['a','b','c','d'].map do(item) item.toUpperCase!
```

```javascript
[1,2,3,4]
```


# Variables & Scoping

## Declaring variables

Variables are declared using `let` and `const` keywords. `let` variables can be changed through reassignment, while `const` variables are readonly after the initial declaration.

```imba
# readonly constant
const one = 123
# single declaration
let a = 123
# multiple declarations
let b = 10, c = 20, d = 30
# array destructuring
let [e,f,...rest] = [1,2,3,4,5]
# object destructuring
let {g,h,data:i} = {g:1,h:2,data:3}
# in conditionals
if let user = array.find(do $1 isa Person)
	yes
```

## Lexical Scopes

`if`, `elif`, `else`, `do`, `for`,`while`,`until`,`switch`,`do` create block scopes. This means that any variable declared in the indented code inside these statements are only available within that scope.

```imba
# global scope
let x = 1 
if true
	# block scope
	let y = 2
y # not a variable in scope
```

## This vs Self

If you come from js, `this` will be a well-known concept. While `this` still exists in imba, working exactly like its js counterpart, `self` is what you should use in imba. It is a very common pattern in js to need to refer to an outer scope when dealing with callbacks, event listeners and more.
```javascript
setup(){
	var self = this;
	[1,2,3].map(function(){
		self.doSomething();
	})
}
```
This is essentially what `self` does under the hood. In imba, `self` is bound do the closest *selfish* scope. Besides the root scope of a file, only the scopes of `def`, `get` and `set` are selfish.

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

## Implicit Self

A lone identifier will always be treated as an accessor on `self` unless a variable of the same name exists in the current scope or any of the outer scopes. This is a hugely important concept to understand.

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
Self always refers to the closest *selfish* scope, and lone identifiers not declared in the lexical scope are treated as properties on self.

## Variable hoisting

Variables are *not* hoisted in Imba. This means that a reference to a variable before its declaration will behave is if there is no declaration - and instead be an implicit access on self.

```imba
def method
	data # not in scope - same as self.data
	let data = {a:1,b:2}
	data # in scope
```

## Root Scope

> TODO Explain how the root scope works with self++

# Operators

## Arithmethic Operators

## Logical Operators

## Comparisons

## Assignments

## Bitwise Operators

# Functions

When we talk about functions in Imba, we refer to anonymous / inline functions declared with the `do` keywords. See methods.

## Defining functions

```imba
# defining a function
const square = do(num) num * num

# inside an object
const util =
    upcase: do(str) str.toUpperCase!
    downcase: do(str) str.toLowerCase!
```

Function scopes are selfless, meaning that `self` inside their function bodies will refer to the closest lexical *selfish* scope. See more about this in the section on Scoping.

### Default parameters
```imba
const multiply = do(a, b = 1)
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
If you want to call a function without arguments, you have two options. Either with an empty pair of parenthesis, or with a `!`, which we call *bang invocation* in Imba.
```imba
# the following expressions are equivalent
Math.random()
Math.random!
```

### Callbacks
Many functions expect another function as an argument. These are often referred to as callbacks. To take a classic example, `Array.map` creates a new array populated with the results of calling a provided function on every element.

Since this is a common pattern, inline anonymous functions can be passed in
```imba
[1,2,3].map do(item)
    item * 2 # [2,4,6]
```
The convention is usually to take the callback as the last argument, but not always.
```imba
setTimeout((do
    console.log 'waited!'
    [1,2,3].reduce((do(sum,value)
        sum + value
    ),0)
),1500) # looks pretty messy
```
When functions expect callbacks as their first (or not-last) argument, you can use `&` as a placeholder for the callback. The `&` is simply a reference to the callback that is supplied at the end of the invocation.
```imba
setTimeout(&,1500) do
    console.log 'waited!'
    [1,2,3].reduce(&,0) do(sum,value)
        sum + value
```

### with arguments
```imba
console.log(1,2,3)
# when invoking a function with arguments the parens are optional
console.log 1,2,3
```

Functions that take a callback can be called with an inline function (`do ...`) after other arguments.
```imba
[10,20,30,40].map do(num) num * 2
```

##### without arguments
```imba
document.location.reload!
```
You are free to use empty parens `()` for invoking functions without arguments, but the preferred style in imba is to use the exclamation mark.



# Control Flow

## For-In Loops

## For-Of Loops

## For-Own-Of loops

## While Loops

## Conditional Statements

### If

### Switch

## Control Transfer Statements

### Continue

### Break

# Classes

## Defining Classes
## Class Instances
## Class Inheritance

# Methods

## Defining methods on target

# Properties

## Stored Properties
## Lazy Properties
## Computed Properties
## Meta Properties



# Import & Export