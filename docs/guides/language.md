---
title: Language
---

# Basic types

Even though the syntax and semantics of Imba is much more related to Ruby than JavaScript, it does compile down to plain performant JavaScript, and is fully compatible with any existing JavaScript library. Imba ships with a rather small runtime for custom tags and utilities, but do not extend any native types from JavaScript. Arrays are arrays, strings are strings, numbers are numbers, classes are constructors with prototypes and so forth. If you simply like Imba better, there is no reason not to write your npm package in Imba, even if it is supposed to be used in the general JavaScript ecosystem. In fact, Imba produces *very* readable JavaScript, by keeping your indentation, comments, and coding style.


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


# Scoping & Self

If you are coming from JavaScript, there are a few things you really need to know when learning Imba. Imba is not like CoffeeScript, in the sense that it does not try to just be a slightly different dialect of JavaScript. Imba compiles to javascript, but the syntax and semantics affects how you would structure your code.

If you are not familiar with ruby, many parts of Imba will probably seem slightly confusing, until you understand the concepts of implicit self and implicit calling. Any lowercase identifier that is not explicitly declared as a variable is treated as an implicit call on the `self` of the current scope. The analyzer / highlighter will help by highlighting variables differently.



### Invocation vs Access

In Imba you are invoking methods with the regular dot-operator. In JavaScript `car.start` will access the `start` property of car. In Imba it will actually *invoke* the `start` method of car. Parenthesis are optional. You can read more about the reasons for this [here]. If you're thinking in JavaScript, this might seem impractical and confusing. The same behaviour can be seen in languages like Ruby.

So, how do we access properties then? You can do it with `car['start']`, just like in JavaScript. Since accessing properties are still used quite a lot when dealing with external libraries written in JavaScript, we also have a shorthand for this, using the unspaced colon-operator `car:start`. For fresh users, this can cause some headache, but after a few hours of coding it will become second nature.

> If you end up using `object:access` repeatedly in your Imba code, it is very likely because you are structuring your code just like you would in JavaScript. In Imba, a class should only expose information and behaviour through methods.



### Implicit self

```imba
hello # compiles to this.hello()
# since hello is not a declared variable
# it assumes 'self' as the implcit context.
```

```imba
# declare the variable hello
var hello = "string"

# now hello will simply be a regular variable access
hello # compiles to hello
```

> There are some predefined global variables



### Setters

Unlike Ruby, Imba has implicit setters as well. Since all variables are explicitly declared in Imba, assigning to something that is not declared is just seen as any other method.

```imba
class Item

    def title= value
        @title = value

    def setup
        # setters are just methods (like in ruby)
        self.title = 'An item'

        # since title is not a declared variable
        # the setter will also use implicit self
        title = 'An item'

```


### self vs this

In Imba, self is the implied context, just like self in ruby. As you will soon learn, self is not directly mapped to this in JavaScript. Self refers to the this of the closest 'closed' scope. Classes and methods are closed scopes, while function expressions are not. When you get used to this, it is really one of the things that make coding Imba very pleasant.

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



# Functions

There are two types of functions in Imba, *methods* and *blocks*.

## Methods

```imba
def randomize
    Math.random
```

```imba
# A single argument
def sqrt num
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



## Blocks

```imba
var sqrt = do |v| v * v
```

Blocks are like anonymous function expressions in JavaScript. They can be assigned and passed around. They have their own lexical scope / closure, but no dynamic scope. This means that self (implicit *and* explicit) inside the block still refers to the self of the outer scope.

Blocks can be passed in directly when calling functions, as the last argument.

```
[1,2,3,4].map do |num| num * 2

item.save do
    # callback trigger when item is saved?
    console.log 'item was saved'
```

# Classes

Classes are basically Java

## Declaration

```imba
class Point
    def initialize x,y
        @x = x
        @y = y
```

Class body


## Instances

To create instances of classes in Imba you use the `new` method. This is not special for classes created in Imba, but is used for creating any object, be it built in constructors in JavaScript like `Array` and any other class/constructor from other languages.

```imba
Point.new(1,2)

```

## Properties

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



## Inheritance

Classes can inherit from other classes. The implementation relies on JavaScript prototypal inheritance, with some added conveniences.

```imba
# Example borrowed from CoffeeScript
class Animal

    def initialize name
        @name = name

    def move meters
        window.alert "{@name} moved {meters}m."

class Snake < Animal
    def move
        window.alert "Slithering..."
        super 5

class Cat < Animal
    def move
        window.alert "Galloping..."
        super 45

var sam = Snake.new "Sammy the Python"
var tom = Horse.new "Tommy the Palomino"

sam.move
tom.move
```

> **TODO** Explain advanced use of super

# Loops

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


# Tags

This one of the main differentiators of Imba. The language has native support for tags. Tags are in fact native DOM elements, with a very lightweight wrapper that provides additional functionality and extensibility. Tags has a separate class hierarchy.

> imba.io is written entirely in Imba, and the views are generated using tags. The same code is rendering both on the server and the client, using the same logic for routing etc. If you are interested, the sourcecode is publicly available at [github](https://github.com/somebee/imba.io).

## Spawning

Imba is indentation-based, and the tag syntax follows the same pattern.

```
<div> # spawning a basic div
```

You can set id and classes using a css-like syntax

```imba
<div#main.one.two.three>
```

You can set attributes

```imba
<div#main.one.two.three tabindex=0 data-level=10>
```

```imba
# you can also toggle a flag dynamically.
# this div only has the class 'red' if isUrgent is truthy
<div.one.two .red=isUrgent>
```

Tags are nested based on indentation.

```imba
<ul.contributors>
    <li> 'Sindre Aarsaether'
    <li> 'Magnus Holm'
    <li> 'Slee Woo'
```

Tags are entities like any other type of object in Imba. They can be spawned, referenced, and manipulated after creation.

```imba
var team = ['Sindre Aarsaether','Magnus Holm','Slee Woo']
var list = <ul.contributors>

# loop through the array
for name in team
    # add a tag for each name to our list
    list.append <li> name

# create a wrapper around the list with a header etc
var page = <div>
    <header> "Contributors"
    <section> list
```

You can also use if-statements, loops and other control flow inside tags

```imba
var team = ['Sindre Aarsaether','Magnus Holm','Slee Woo']

var page = <div>
    <header> "Contributors"
    <section>
        <ul> for name in team
            <li.member> name
```


### Setting attributes
```imba
<div title='Example' tabindex=0 data-name='ok'>
```

```imba
var title = <h1> 'This is a title'

# id and classes can be set using a css/haml-like syntax
var main = <div#main.red.large title='welcome'> 'Main div'

# tags can naturally be nested using indentation
var list = <ul.products>
    <li> 'Milk'
    <li> 'Coolaid'
    <li> 'Bacon'

# and be referenced in other tag trees
var app = <div#app>
    <header> title
    <section> list
```

## Declaring

Tags are basically a separate Class hierarchy with syntactic sugar for instantiating nodes. All html elements are predefined, but you can also extend these tags, or inherit from them with your own tags. The syntax for creating new tags is very similar to our class syntax.

```imba
tag todo
    attr title
    attr completed

# Now you can spawn this tag like any other
var list = <div.todos>
    <todo title='Buy milk' completed=yes>
    <todo title='Finish documentation' completed=no>
    <todo.urgent title='Launch new website' completed=no>
```

### Inheritance

Since tags are just a separate hierarchy of classes, we can also subclass tags (both our own and the native tags).

```imba
tag entry < li
tag group < entry
tag project < entry
tag task < entry
```

```imba
tag sketchpad < canvas

    def ontouchstart touch
        yes

# Now you can spawn this tag like any other
var pad = <sketchpad width=500 height=300>
```

Custom tags still use native supported node types in the DOM tree. Our `<sketchpad>` will render as a `<canvas class='_sketchpad'>` in the DOM, while `<task>` will render as `<li class='_entry _task'>`. This means that css/styling can also be inherited, and we can use query selectors to select all entries (including inherited tags project and task).

