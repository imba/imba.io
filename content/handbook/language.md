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
let iterable = 'foo'
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

### Iterating with `index`
```imba
let iterable = new Map([['a',1],['b',2],['c',3]])
for entry,idx of iterable
    console.log entry,idx
for [key,value],idx of iterable
    console.log key,value,idx
```
> In Imba you can supply a second parameter to `for ... of`. This will be populated with the current iteration number (starting at 0), just like the second argument in `Array#map` and `Array#forEach`.

### For-Own-Of

A pretty common need is to loop through the key-value pairs of objects. The default recommended way to do this in JavaScript is:

```javascript
let obj = {a: 1, b: 2, c: 3}
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
var res = for num in [1,2,3,4,5]
    break if num == 3
    num * 2
# [2,4]
```

### Continue with value

When supplying an argument to continue, this value will be added to the resulting array, essentially like an early return would do in an `Array#map` function.

```imba
var res = for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
# continue with an argument acts like early return within Array#map
# res => [2,4,-1,8,10]
```

## Break

`break` is supported in all loop types (`for in`, `for of` and `for own of`)

```imba
var res = for num in [1,2,3,4,5]
    break if num == 3
    num * 2
# [2,4]
```

### Break with value

You can also supply an argument to break. When supplying an argument to break, this value will be added to the resulting array. This is especially useful when you want to return until some condition is met, but also want to include the item at which condition was met.

```imba
var res = for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
```

## If / Elif / Else

### If [snippet]

The if statement executes the indented code if a specified condition is truthy.

```imba
# indented
if condition
    console.log 'yes!'
```

### Unless [snippet]

The unless statement executes the indented code if a specified condition is *not* truthy.

```imba
unless condition
    console.log 'condition was not truthy'
```
> The unless statement executes the indented code if a specified condition is *not* truthy.



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