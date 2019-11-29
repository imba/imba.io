---
title: Language
---

# language

## Basic types

Even though the syntax and semantics of Imba is much more related to Ruby than JavaScript, it does compile down to plain performant JavaScript, and is fully compatible with any existing JavaScript library. Imba ships with a rather small runtime for custom tags and utilities, but do not extend any native types from JavaScript. Arrays are arrays, strings are strings, numbers are numbers, classes are constructors with prototypes and so forth. If you simply like Imba better, there is no reason not to write your npm package in Imba, even if it is supposed to be used in the general JavaScript ecosystem. In fact, Imba produces _very_ readable JavaScript, by keeping your indentation, comments, and coding style.

#### Strings

```text
var single = 'single quotes'
var double = "double quotes"
var interpolation = "string has {double}"
```

#### Numbers

```text
var integer = 42
var float = 42.10
```

#### Objects

```text
var object = {name: 'Imba', type: 'Language'}
```

#### Arrays

```text
var array = [1,2,3,4,5]
```

#### Regexes

```text
var regex = /number is (\d+)/
```

#### Functions

```text
def hello
    log 'got here'
    return 'world'

log hello
```

#### Classes

```text
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

#### Implicit self

```text
hello # compiles to this.hello()
# since hello is not a declared variable
# it assumes 'self' as the implicit context.
```

```text
# declare the variable hello
var hello = "string"

# now hello will simply be a regular variable access
hello # compiles to hello
```

> Imba has some predeclared global variables: `window`, `document`, `console`, `process`, `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `parseInt`, `parseFloat`, `__dirname`
>
> This means that these will always resolve to variables. If you have defined a `console` method on an object, it must be called with explicit self: `self.console('something')`

#### self vs this

In Imba, `self` is the implied context, just like `self` in ruby. As you will soon learn, self is not directly mapped to this in JavaScript. Self refers to the this of the closest 'closed' scope. Classes and methods are closed scopes, while function expressions are not. When you get used to this, it is really one of the things that make coding Imba very pleasant.

```text
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

> `this` _always_ refers to the this you know and love \(or hate\) from JavaScript. So if you really need to access the this inside a callback or block, you should use this explicitly.

#### Implicit invocation

In Imba you are invoking methods with the regular dot-operator. In JavaScript `car.start` will access the `start` property of car. In Imba it will actually _invoke_ the `start` method of car. Parenthesis are optional. You can read more about the reasons for this \[here\]. If you're thinking in JavaScript, this might seem impractical and confusing. The same behaviour can be seen in languages like Ruby.

So, how do we access properties then? You can do it with `car['start']`, just like in JavaScript. Since accessing properties are still used quite a lot when dealing with external libraries written in JavaScript, we also have a shorthand for this, using the unspaced colon-operator `car:start`. For fresh users, this can cause some headache, but after a few hours of coding it will become second nature.

> If you end up using `object:access` repeatedly in your Imba code, it is very likely because you are thinking in JavaScript. In Imba, a class should only expose information and behaviour through methods.

Unlike Ruby, Imba has implicit setters as well. Since all variables are explicitly declared in Imba, assigning to something that is not declared is just seen as any other method. `name = 1` resolves to a setter, and compiles to `self.setName(1)` if `name` is not a declared variable.

## Functions

There are two types of functions in Imba, _methods_ and _blocks_.

### Methods

```text
def randomize
    Math.random
```

```text
# A single argument
def square num
    num * num
```

```text
# optional arguments
def call url, method = 'GET'
    # do something here
```

```text
# Variadic arguments
def race winner, *rest
    "{winner} beat {rest.join(', ')}"
```

```text
# Optional arguments, with callback
def save data, options = {}, &callback
    # do something here
```

```text
# Named parameters
def animate values, ease: 'linear', duration: 1
    # do something here
```

### Blocks

```text
var square = do |v| v * v
```

Blocks are like anonymous function expressions in JavaScript. They can be assigned and passed around. They have their own lexical scope / closure, but no dynamic scope. This means that self \(implicit _and_ explicit\) inside the block still refers to the self of the outer scope.

Blocks can be passed in directly when calling functions, as the last argument.

```text
[1,2,3,4].map do |num| num * 2

item.save do
    # callback trigger when item is saved?
    console.log 'item was saved'
```

## Classes

### Declaration

```text
class Point
    def initialize x,y
        @x = x
        @y = y
```

### Instances

To create instances of classes in Imba you use the `new` method like `Array.new`, as opposed to the special `new Array()` syntax in JavaScript. This is not special for classes created in Imba, but is used for creating any object, be it built in constructors in JavaScript like `Array`, `Object`, `RegEx` and any other class/constructor from other languages.

### Properties

You can define properties on classes, which are automatically generated getters and setters. As mentioned earlier, Imba embraces the philosophy that classes should expose everything through methods. If you want to get/set the title of a `Todo` in JavaScript, it's not uncommon to just get/set it as a property directly. In Imba, you would want to instead define _methods_ to set and get the title.

```text
class Todo

    prop title
```

The above is basically a quick way to define both a getter and a setter for the instance variable title.

```text
class Todo

    def title
        @title

    def title= value
        @title = value
```

> **TODO** Explain advanced features of `prop` and `attr`.

### Inheritance

Classes can inherit from other classes. The implementation relies on JavaScript prototypal inheritance, with some added conveniences.

```text
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

Loops in Imba behaves similar to array comprehensions in CoffeeScript and Python. They are expressions, and can be returned and assigned. When used as expressions they will always return an array \(like Array\#map, but with a few additional powerful features, like break / continue\).

**for in**

```text
for num in [1,2,3]
    num * 2
```

**for of**

```text
for key,value of {a: 1, b: 2}
    value * 2
```

**while**

```text
while true
    break if Math.random < 0.1
```

**until**

```text
until Math.random < 0.1
    gamble
```

#### For in

**loops are expressions**

```text
var list = [1,2,3,4,5]
var doubles = for num in [1,2,3]
    num * 2
```

**looping with index argument**

```text
for num,i in [1,2,3]
    num * i
```

**go through every other element**

```text
for num in [1,2,3] by 2
    num * 2
```

**filter by condition**

```text
for num in list when num > 1
    num
```

> **Tip!** Any type of object can support being iterated with forin in Imba. If the compiler does not know that the target is an array \(at compiletime\) it will look for \(and call\) `target.toArray` if it exists, and then loop through this.

#### For of

**for of \(all keys\)**

```text
var object = {a: 1, b: 2, c: 3, d: 4}
# loop over all keys of object
for k,value of object
    value == 2
```

**for own of \(own keys\)**

```text
var obj = Object.create({a: 1, b: 1, c: 1})
obj:b = obj:d = 2

for own key,value of obj
    "{key} is {value}"
```

#### Break / Continue

**Continue**

```text
for num in [1,2,3,4,5]
    continue if num == 3
    num * 2
```

**continue with expression**

```text
for num in [1,2,3,4,5]
    continue -1 if num == 3
    num * 2
```

**Break**

```text
for num in [1,2,3,4,5]
    break if num == 3
    num * 2
```

**Break with expression**

```text
for num in [1,2,3,4,5]
    break -1 if num == 3
    num * 2
```

## Tags

This one of the main differentiators of Imba. The language has native support for tags. Tags are in fact native DOM elements, with a very lightweight wrapper that provides additional functionality and extensibility. Tags has a separate class hierarchy.

> imba.io is written entirely in Imba, and the views are generated using tags. The same code is rendering both on the server and the client, using the same logic for routing etc. If you are interested, the sourcecode is publicly available at [github](https://github.com/somebee/imba.io).

In JavaScript you can create tags using `document.createElement('div')`. Tags are first-class citizens in Imba. To create a div you simply write `<div>`. You can look at tags in Imba as a native shorthand syntax for spawning html elements. As you will also learn, this syntax for creating tags support a css-like syntax for setting id,classes,events,attributes and more. `<div.red>` will create a div with class 'red'. `<div#main.one>` creates a tag with id 'main' and a class 'one'. Attributes are set like `<div.large tabindex=0 data-level=10>`. Here are a few more example of literal tags and their resulting HTML.

```text
<div> 'Some text' # <div>Some text</div>
<div.red.blue>    # <div class='red blue'></div>
<div title='App'> # <div title='App'></div>
<b> <i> 'Coolio'  # <b><i>Coolio</i></b>
```

As you can see, tags are not explicitly closed, instead relying on indentation like the rest of Imba. This works for arbitrarily deep tag trees.

```text
<ul.contributors>
    <li> 'Sindre Aarsaether'
    <li> 'Magnus Holm'
    <li> 'Slee Woo'
```

Since tags are first-class entities like any other type of object in Imba, they can be spawned, referenced, and manipulated after creation.

```text
var node = <div.red>
node.unflag('red')
node.flag('blue')
node.append <div.child>
node.css display: 'block'
```

To browse through the available methods for tags, [check out the API](https://github.com/imba/imba.io/tree/153e12a617d58a9538f0cd7794a79ece8c4223b1/docs/README.md#api-Imba_Tag__build)

```text
var list = <ul.contributors>

for name in ['Sindre Aarsaether','Magnus Holm','Slee Woo']
    list.append <li> name # add tag for each name

# include the list in a tag tree
<article>
    <header> "Contributors"
    <section> list
```

You can also use if-statements, loops and other control flow inside tags, to easily write all your views in the order they are to be rendered.

```text
<div>
    <header> "Contributors"
    <section>
        <ul> for alias in ['somebee','judofyr','sleewoo']
            <li> <a href="http://github/{alias}"> alias
```

To fully appreciate how tags work in Imba \(and to get a glimpse into why [Imba is so fast](http://somebee.github.io/todomvc-render-benchmark/index.html)\), it is important to understand they way in which tags are created in the compiled code. Frameworks for creating tags usually passes the attributes in an object, like `tag('div', {title: 'Yeah', className: 'red blue'})`.

Imba takes a different approach, by building the tags using a **chain of setters/calls**. `<div.red.blue title='Yeah'>` compiles to `tag.div().flag('red').flag('blue').setTitle('Yeah').end()`. Besides being _much_ faster on modern JS engines, it is of paramount importance when we move on to static / cached tag trees, our alternative to the virtual DOM approach of many well-known frameworks.

### Declaring

Tags are basically a separate Class hierarchy with syntactic sugar for instantiating nodes. All html elements are predefined, but you can also extend these tags, or inherit from them with your own tags. The syntax for creating new tags is very similar to our class syntax.

```text
tag todo < li
    attr title
    attr completed

    def complete
        completed = yes

var list = <ul.todos>
    <todo title='Buy milk' completed=yes>
    <todo title='Finish documentation'>
    <todo.urgent title='Launch new website'>
```

But will my custom tags be valid HTML? In short, yes. The native DOM node will always be the real tag in the inheritance chain. In the above example, todo tags spawn as li tags: `<li class='_todo'></li>`. As you can see, custom tags will automatically add a prefixed className to identify its type. This also works for deeper inheritance:

```text
# define custom tags
tag entry < li
tag project < entry
tag todo < entry

# spawning these tags
<entry>   # <li class='_entry'></li>
<project> # <li class='_entry _project'></li>
<todo>    # <li class='_entry _todo'></li>
```

This makes custom tags even more useful. Since the inheritance chain is represented on the actual DOM node, we can query the dom for all entries \(including _todos_ and _projects_\). `querySelectorAll('._entry')` will match all of them.

> **Tip!** The fact that tags include their inheritance chain as class names also makes it easier to structure your styles. In the example above, you can style all entries through .\_entry, and target only projects with .\_project etc.

### Events

You can define methods for handling events just like you would define other methods or attributes on tags. Events are efficiently handled by Imba at the root document. You can define and override as many events as you'd like, no matter if you have 10 or 10000 instances of the affected tags. Binding to the click/tap event of _all_ tags of a certain type is as simple as declaring a method:

```text
tag todo
    attr completed

    def ontap
        # triggered when a <todo> is tapped
        completed = yes
```

Since tags are just like any other class hierarchy, it is easy to override event handlers in subclasses.

```text
tag special-todo < todo

    def ontap
        completed = yes
        title = "{title} finally done!"
```

> Todo! Explain unified mouse/touch api [Imba.Touch](https://github.com/imba/imba.io/tree/153e12a617d58a9538f0cd7794a79ece8c4223b1/docs/README.md#api-Imba_Touch) and `ontouchstart`, `ontouchmove`, `ontouchend`.

### Extending

Like classes, tags can also be reopened and extended. Although it is certainly not recommended, it is easy to override the click-event of all links by extending the native tag:

```text
extend tag a
    def onclick event
        event.cancel
        window.alert('Intercepted!')
```

The code above _will_ override the click action of all links on the page, including the links that already exists. This is a natural result of the fact that DOM nodes are linked with their lightweight Imba counterpart. Binding events to tags have never been easier or more performant!

> Extending native tags is not recommended unless you know what you are doing, _and_ you're not interacting with external imba code. We are working on support for namespacing to avoid collisions across projects.

### Rendering

> A detailed guide about views and rendering is right around the corner. Get in touch and we'll try to help you along. Until then it might be enlightening to check the [sourcecode](http://github.com/somebee/imba.io) of this site!

