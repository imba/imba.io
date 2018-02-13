---
title: Guide
---

# Essentials

## Introduction

### What is Imba?

Imba is a new programming language for the web that compiles
to performant JavaScript. It is heavily inspired by ruby and python,
but developed explicitly for web programming (both server and client).
It has language level support for defining, extending, subclassing,
instantiating and rendering dom nodes. For a semi-complex application like 
[TodoMVC](http://todomvc.com), it is more than [10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html)
with less code, and a much smaller library.

```imba
var number = 42
var opposite = true
var string = "the answer is {number}"
var regex = /answer is (\d+)/

var info =
    name: 'Imba'
    version: Imba.VERSION
    repository: 'https://github.com/somebee/imba'
    inspiration: ['ruby','python','react','coffeescript']
    creator: 'Sindre Aarsaether'
    contributors: [
        'Sindre Aarsaether' # github.com/somebee
        'Magnus Holm' # github.com/judofyr
        'Slee Woo' # github.com/sleewoo
    ]
```

All snippets of code in the documentation are editable inline,
with highlighting and annotations. It is implemented in [scrimbla](http://github.com/somebee/scrimbla) - an experimental web based editor for imba, written in imba. Don't expect it to work perfectly just yet, but have fun.

The Imba compiler is itself written in Imba, using a custom version of the
Jison parser generator. The command-line version of imba is available as a
node.js utility. The compiler itself does not depend on Node, and can be
run in any JavaScript environment, or in the browser.

> Some people might be confused by the comparison to React. React is a framework, Imba is a language - are these two comparable? [see discussion](https://news.ycombinator.com/item?id=10094371)

## Getting started

The easiest way to get started with Imba is to play around in the [scrimba.com Hello World example](https://scrimba.com/c/cE4nGcg). If you rather want to try Imba in your own environment you can clone [hello-world-imba](https://github.com/somebee/hello-world-imba) and follow the instructions in the readme. There are plugins available for [Sublime Text](https://packagecontrol.io/packages/Imba), [VSCode](https://github.com/somebee/vscode-imba) and [Atom](https://atom.io/packages/language-imba).


## Tags & Rendering

Even though Imba is a full-fledged language capable for replacing JavaScript on the server, it *really* shines when working with tags.

### Attributes

### Templates

Explain '->' and '=>'

### Conditional Rendering

### List Rendering

### Conditional Classes

### Data Binding

## Event Handling

### Resolving functions

### Modifiers

### Declaring on tags

## Form Input Bindings

## Custom Components

How to create custom components
Inheriting from other components

### Self

What is self? Compare to react.

## State Handling

Language, not framework.

# Language

## Basics

Even though the syntax and semantics of Imba is much more related to Ruby than JavaScript, it does compile down to plain performant JavaScript, and is fully compatible with any existing JavaScript library. Imba does not extend any native types from JavaScript. Arrays are arrays, strings are strings, numbers are numbers, classes are constructors with prototypes and so forth. If you simply like Imba better, there is no reason not to write your npm package in Imba, even if it is supposed to be used in the general JavaScript ecosystem. In fact, Imba produces *very* readable JavaScript, by keeping your indentation, comments, and coding style.

### Strings

```imba
var single = 'single quotes'
var double = "double quotes"
var interpolation = "string has {double}"
```

### Numbers

```imba
var integer = 42
var float = 42.10
```

### Objects

```imba
var object = {name: 'Imba', type: 'Language'}
```


### Arrays

```imba
var array = [1,2,3,4,5]
```

### Regexes

```imba
var regex = /number is (\d+)/
```

### Functions

```imba
def hello
    log 'got here'
    return 'world'

log hello
```

### Classes

```imba
class Todo

    def initialize title
        @title = title
        @completed = no

    def complete
        @completed = yes
```

> **Tip!** All examples are editable inline, and you can see the compiled JavaScript by tapping the 'js' button at the top right of each example. This is often very valuable to understand how Imba maps to JavaScript.


## Caveats

If you are coming from JavaScript, there are a few things you really need to know when learning Imba. Imba is not like CoffeeScript, in the sense that it does not try to just be a slightly different dialect of JavaScript. Imba compiles to javascript, but the syntax and semantics affects how you would structure your code.

If you are not familiar with ruby, many parts of Imba will probably seem slightly confusing until you understand the concepts of implicit self and implicit calling. Any lowercase identifier that is not explicitly declared as a variable is treated as an implicit call on the `self` of the current scope.The analyzer / highlighter will help by highlighting variables differently.

### Implicit self

```imba
hello # compiles to this.hello()
# since hello is not a declared variable
# it assumes 'self' as the implicit context.
```

```imba
# declare the variable hello
var hello = "string"

# now hello will simply be a regular variable access
hello # compiles to hello
```

> Imba has some predeclared global variables: `window`, `document`, `console`, `process`, `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `parseInt`, `parseFloat`, `__dirname`
> 
> This means that these will always resolve to variables. If you have defined a `console` method on an object, it must be called with explicit self: `self.console('something')`  

### self vs this

In Imba, `self` is the implied context, just like `self` in ruby. As you will soon learn, self is not directly mapped to this in JavaScript. Self refers to the this of the closest 'closed' scope. Classes and methods are closed scopes, while function expressions are not. When you get used to this, it is really one of the things that make coding Imba very pleasant.

```imba
class Item

    def update data
        # do something
        self

    def fetch
        request('/some-url') do |data|
            # functions as blocks are not closed scopes,
            # so the implicit self will still refer to the
            # self of the outer method.
            self.update data

```

> `this` *always* refers to the this you know and love (or hate) from JavaScript. So if you really need to access the this inside a callback or block, you should use this explicitly.

### Implicit invocation

In Imba you are invoking methods with the regular dot-operator. In JavaScript `car.start` will access the `start` property of car. In Imba it will actually *invoke* the `start` method of car. Parenthesis are optional. You can read more about the reasons for this [here]. If you're thinking in JavaScript, this might seem impractical and confusing. The same behaviour can be seen in languages like Ruby.

So, how do we access properties then? You can do it with `car['start']`, just like in JavaScript. Since accessing properties are still used quite a lot when dealing with external libraries written in JavaScript, we also have a shorthand for this, using the unspaced colon-operator `car:start`. For fresh users, this can cause some headache, but after a few hours of coding it will become second nature.

> If you end up using `object:access` repeatedly in your Imba code, it is very likely because you are thinking in JavaScript. In Imba, a class should only expose information and behaviour through methods.

Unlike Ruby, Imba has implicit setters as well. Since all variables are explicitly declared in Imba, assigning to something that is not declared is just seen as any other method. `name = 1` resolves to a setter, and compiles to `self.setName(1)` if `name` is not a declared variable.


## Functions

There are two types of functions in Imba, *methods* and *blocks*.

### Methods

```imba
def randomize
    Math.random
```

```imba
# A single argument
def square num
    num * num
```

```imba
# optional arguments
def call url, method = 'GET'
    # do something here
```

```imba
# Variadic arguments
def race winner, *rest
    "{winner} beat {rest.join(', ')}"
```

```imba
# Optional arguments, with callback
def save data, options = {}, &callback
    # do something here
```

```imba
# Named parameters
def animate values, ease: 'linear', duration: 1
    # do something here
```



### Blocks

```imba
var square = do |v| v * v
```

Blocks are like anonymous function expressions in JavaScript. They can be assigned and passed around. They have their own lexical scope / closure, but no dynamic scope. This means that self (implicit *and* explicit) inside the block still refers to the self of the outer scope.

Blocks can be passed in directly when calling functions, as the last argument.

```
[1,2,3,4].map do |num| num * 2

item.save do
    # callback trigger when item is saved?
    console.log 'item was saved'
```

## Classes

### Declaration

```imba
class Point
    def initialize x,y
        @x = x
        @y = y
```

### Instances

To create instances of classes in Imba you use the `new` method like `Array.new`, as opposed to the special `new Array()` syntax in JavaScript. This is not special for classes created in Imba, but is used for creating any object, be it built in constructors in JavaScript like `Array`, `Object`, `RegEx` and any other class/constructor from other languages.

### Properties

You can define properties on classes, which are automatically generated getters and setters. As mentioned earlier, Imba embraces the philosophy that classes should expose everything through methods. If you want to get/set the title of a `Todo` in JavaScript, it's not uncommon to just get/set it as a property directly. In Imba, you would want to instead define *methods* to set and get the title.

```imba
class Todo

    prop title

```

The above is basically a quick way to define both a getter and a setter for the instance variable title.

```imba
class Todo

    def title
        @title

    def title= value
        @title = value

```

> **TODO** Explain advanced features of `prop` and `attr`.

### Inheritance

Classes can inherit from other classes. The implementation relies on JavaScript prototypal inheritance, with some added conveniences.

```imba
# Example borrowed from coffeescript.org
class Animal

    def initialize name
        @name = name

    def move meters
        console.log "{@name} moved {meters}m."

class Snake < Animal
    def move
        console.log "Slithering..."
        super 5

class Horse < Animal
    def move
        console.log "Galloping..."
        super 45

var sam = Snake.new "Sammy the Python"
var tom = Horse.new "Tommy the Palomino"

sam.move
tom.move
```

> **TODO** Explain advanced use of super

## Loops

Loops in Imba behaves similar to array comprehensions in CoffeeScript and Python. They are expressions, and can be returned and assigned. When used as expressions they will always return an array (like Array#map, but with a few additional powerful features, like break / continue).

#### for in
```imba
for num in [1,2,3]
    num * 2
```

#### for of
```imba
for key,value of {a: 1, b: 2}
    value * 2
```

#### while
```imba
while true
    break if Math.random < 0.1
```

#### until
```imba
until Math.random < 0.1
    gamble
```


### For in

#### loops are expressions
```imba
var list = [1,2,3,4,5]
var doubles = for num in [1,2,3]
    num * 2
```

#### looping with index argument
```imba
for num,i in [1,2,3]
    num * i
```

#### go through every other element
```imba
for num in [1,2,3] by 2
    num * 2
```

#### filter by condition
```imba
for num in list when num > 1
    num
```

> **Tip!** Any type of object can support being iterated with forin in Imba. If the compiler does not know that the target is an array (at compiletime) it will look for (and call) `target.toArray` if it exists, and then loop through this.

### For of

#### for of (all keys)
```imba
var object = {a: 1, b: 2, c: 3, d: 4}
# loop over all keys of object
for k,value of object
    value == 2
```

#### for own of (own keys)
```imba
var obj = Object.create({a: 1, b: 1, c: 1})
obj:b = obj:d = 2

for own key,value of obj
    "{key} is {value}"
```

### Break / Continue

#### Continue
```imba
for num in [1,2,3,4,5]
    continue if num == 3
    num * 2
```

#### continue with expression
```imba
for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
```

#### Break
```imba
for num in [1,2,3,4,5]
    break if num == 3
    num * 2
```

#### Break with expression
```imba
for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
```


## Tags

This one of the main differentiators of Imba. The language has native support for tags. Tags are in fact native DOM elements, with a very lightweight wrapper that provides additional functionality and extensibility. Tags has a separate class hierarchy.

> imba.io is written entirely in Imba, and the views are generated using tags. The same code is rendering both on the server and the client, using the same logic for routing etc. If you are interested, the sourcecode is publicly available at [github](https://github.com/somebee/imba.io).

In JavaScript you can create tags using `document.createElement('div')`. Tags are first-class citizens in Imba. To create a div you simply write `<div>`. You can look at tags in Imba as a native shorthand syntax for spawning html elements. As you will also learn, this syntax for creating tags support a css-like syntax for setting id,classes,events,attributes and more. `<div.red>` will create a div with class 'red'. `<div#main.one>` creates a tag with id 'main' and a class 'one'. Attributes are set like `<div.large tabindex=0 data-level=10>`. Here are a few more example of literal tags and their resulting HTML.

```imba
<div> 'Some text' # <div>Some text</div>
<div.red.blue>    # <div class='red blue'></div>
<div title='App'> # <div title='App'></div>
<b> <i> 'Coolio'  # <b><i>Coolio</i></b>
```

As you can see, tags are not explicitly closed, instead relying on indentation like the rest of Imba. This works for arbitrarily deep tag trees.

```imba
<ul.contributors>
    <li> 'Sindre Aarsaether'
    <li> 'Magnus Holm'
    <li> 'Slee Woo'
```

Since tags are first-class entities like any other type of object in Imba, they can be spawned, referenced, and manipulated after creation.

```
var node = <div.red>
node.unflag('red')
node.flag('blue')
node.append <div.child>
node.css display: 'block'
```

To browse through the available methods for tags, [check out the API](/docs#api-Imba_Tag__build)


```imba
var list = <ul.contributors>

for name in ['Sindre Aarsaether','Magnus Holm','Slee Woo']
    list.append <li> name # add tag for each name

# include the list in a tag tree
<article>
    <header> "Contributors"
    <section> list

```

You can also use if-statements, loops and other control flow inside tags, to easily write all your views in the order they are to be rendered.

```imba
<div>
    <header> "Contributors"
    <section>
        <ul> for alias in ['somebee','judofyr','sleewoo']
            <li> <a href="http://github/{alias}"> alias
```

To fully appreciate how tags work in Imba (and to get a glimpse into why [Imba is so fast](http://somebee.github.io/todomvc-render-benchmark/index.html)), it is important to understand they way in which tags are created in the compiled code. Frameworks for creating tags usually passes the attributes in an object, like `tag('div', {title: 'Yeah', className: 'red blue'})`.

Imba takes a different approach, by building the tags using a **chain of setters/calls**. `<div.red.blue title='Yeah'>` compiles to `tag.div().flag('red').flag('blue').setTitle('Yeah').end()`. Besides being *much* faster on modern JS engines, it is of paramount importance when we move on to static / cached tag trees, our alternative to the virtual DOM approach of many well-known frameworks.

