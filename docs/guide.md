# guide

## Essentials

### Introduction

#### What is Imba?

Imba is a new programming language for the web that compiles to performant JavaScript. It is heavily inspired by ruby and python, but developed explicitly for web programming \(both server and client\). It has language level support for defining, extending, subclassing, instantiating and rendering dom nodes. For a semi-complex application like [TodoMVC](http://todomvc.com), it is more than [10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html) with less code, and a much smaller library.

```text
var number = 42
var opposite = true
var string = "the answer is {number}"
var regex = /answer is (\d+)/

var info =
    name: 'Imba'
    version: Imba.VERSION
    repository: 'https://github.com/imba/imba'
    inspiration: ['ruby','python','react','coffeescript']
    creator: 'Sindre Aarsaether'
    contributors: [
        'Sindre Aarsaether' # github.com/somebee
        'Magnus Holm' # github.com/judofyr
        'Slee Woo' # github.com/sleewoo
    ]
```

> Even though Imba has been used privately, in production, for more than a year \(powering scrimba.com\), the community is in the early stages, and documentation is still sparse. If you are a person who takes joy in learning new technologies and are not afraid to learn by doing, please keep reading.

#### Getting started

> This guide assumes knowledge of HTML, CSS and JavaScript \(or another programming language\). It will be especially helpful to know React to grasp how tags and custom tags work.

The easiest way to get started with Imba is to play around in the [scrimba.com Hello World example](https://scrimba.com/c/cE4nGcg). If you rather want to try Imba in your own environment you can clone [hello-world-imba](https://github.com/somebee/hello-world-imba) and follow the instructions in the readme. There are plugins available for [Sublime Text](https://packagecontrol.io/packages/Imba), [VSCode](https://github.com/somebee/vscode-imba) and [Atom](https://atom.io/packages/language-imba).

In this guide we will create a very simple application that highlights some of features of Imba. Even though Imba is a full-fledged language capable for replacing JavaScript on the server, it _really_ shines when working with tags. Our goal is initially to understand everything that is going on in this incredibly original todo list:

```text
const store =
    title: ""
    items: []
    def addItem
        self:items.push(title: self:title)
        self:title = ""

Imba.mount <div[store].vbox ->
    <div.header>
        <input model='title' :keyup.enter.addItem>
        <button :tap.addItem> 'add'
    <ul> for item in data:items
        <li> item:title
```

### Tag Syntax

#### Instantiating Tags

```text
let element = <div.main> "Hello"
```

The above declaration might look strange at first. DOM elements are first-class citizens in Imba. We are creating a _real_ dom element, with the className "main" and textContent "Hello".

Let's break down the basic syntax before we move on to more advanced examples. Since setting classes of elements is very common, so imba has a special shorthand syntax for this. You declare classes by adding a bunch of `.classname` after the tag type. You can add multiple classes like `<div.large.header.primary>`. Can you guess how to set the id of a tag? It uses a similar syntax: `<div#app.large.ready>`.

#### Conditional Classes

One very common need when developing web apps is to set a className only when some condition is true. Imba has a shorthand syntax for this too:

```text
# only add 'ready' class if expression is truthy
<div.header .ready=expression>
```

#### Dynamic classes

What about setting fully dynamic classes? E.g. if state is a variable containing a string, you can set it like this;

```text
let state = "busy"
let element = <div.header .{state}>
```

#### Setting inline styles

```text
<div css:display='block' css:color='red'>
```

#### Setting custom data

When we move on to custom tags, you will find that tags very often represent some data.

```text
# these two are equivalent. The latter is preferred convention
# for passing data to a tag. 
<AppView data=myData title="Application"> 
<AppView[myData] title="Application">
```

#### Rendering Lists

You might notice that we never close our tags. Rather than being delimited by curly braces or “begin/end” keywords, blocks are delimited by indentation, and so are tags. This might seem weird in the beginning, but it makes for very readable and concise code. So, if we want to create a list with some children, we simply go:

```text
let list = <ul>
    <li> "Understand indentation"
    <li> "Get used to it"
    <li> "Cherish it"
```

If we have a dynamic list we can simply use a `for in` loop:

```text
let activities = ["Eat", "Sleep", "Code"]
let list = <ul>
    for activity in activities
        <li> <span.name> activity
```

#### Conditional Rendering

```text
let app = <div>
    if isLoggedIn
        <a href="/logout"> "Log out"
    else
        <a href="/register"> "Register"
```

### Custom Tags

#### Declaring Tags

You can easily define your own tags / components, as easily as creating classes. They are similar to components in react. Tags are defined with the `tag`keyword:

```text
tag App
    # custom instance methods, properties etc

# create an instance of app - just like any other tag
let app = <App.main> <h1> "Hello"
```

Your custom tags will by default inherit from ‘div’, but they can inherit from any tag. You can also define instance methods on them.

```text
# define a custom tag, inheriting from form
tag RegisterForm < form
    def onsubmit event
        # declare handlers as methods
        console.log "submitted"

    def someMethod
        console.log "hello"
        self

# create an instance of app - just like any other tag
let form = <RegisterForm>
form.someMethod # => "hello"
```

> When you declare `tag SomeComponent`you are declaring a new tag _type_, not an instance. It is exactly the same as declaring a new `class SomeClass` . `<SomeComponent>`creates a new _instance_ of this tag, just like `SomeClass.new` creates a new instance of said class.

#### Custom Rendering

Just like components in react, you can declare how custom tags should render, by declaring a render method:

```text
# define a custom tag, inheriting from form
tag App
    def render
        <self> <h1> "Hello world"

let app = <App.main>
# The DOM tree of app is now:
# <div class='App main'><h1>Hello world</h1></div>
```

> `<self>` inside render deserves some explanation. In Imba, instances of tags are directly linked to their real DOM element. `<self>` refers to the component itself, and is a way of saying "now I want the content inside self to look exactly like the following. This is important to understand.

```text
tag Wrong
    def render
        <h1> "Hello {Math.random}"

let wrong = <Wrong>
# wrong.render would now simply create a new h1 element
# every time it is called. The DOM element of wrong will
# still have no children.

tag Right
    def render
        <self> <h1> "Hello {Math.random}"
let right = <Right>
# right.render will now update its own DOM tree every time
# it is called, ensuring that the DOM is in fact reflecting
# the view declared inside <self>
```

#### Inheritance

Custom tags can inherit from other custom tags, or from native tags. E.g. if you want to create a custom form component, you can simply inherit from form:

```text
tag RegisterForm < Form

let view = <RegisterForm>
# the DOM element of view is now of type form.
# html: <form class='RegisterForm'></form>
```

#### Custom properties

```text
# define a custom tag, inheriting from form
tag App
    # declaring custom properties
    prop user
    prop route

    def render
        <self>
            <h1> "Route is: {route}"
            if route == '/home'
                <div> "You are home"

let app = <App user=someUser route='/home'>
```

### Event Handling

#### Listening to Events

We can use `<tag :eventname=handler>` to listen to DOM events and run code when they’re triggered.

```text
tag App
    prop counter
    def render
        <self>
            <div> "count is {counter}"
            # handler will be called when clicking button
            <button :click=(do counter++)> "Increment"

Imba.mount <App counter=0>
```

In the example above we declared the handler inline. Usually it is better to define the handlers outside of the view, and decouple them from the event itself. This can be done in several ways.

#### Resolving Handlers

You can also supply a string as the handler \(`<div :click="doSomething">`\). In this case, Imba will look for the handler by traversing up the DOM tree and call getHandler on each node, until a handler is returned. The method looks like this:

```text
def getHandler handlerName
    if self[handlerName + "Modifier"] isa Function
        return self[handlerName + "Modifier"]
    if self[handlerName] isa Function
        return self
    elif @data and @data[handlerName] isa Function
        return @data
```

This means that if you have defined methods on your custom tags, you can refer to these methods:

```text
tag App
    prop counter
    def increment
        counter++

    def render
        <self>
            <div> "count is {counter}"
            <button :click='increment'> "Increment"

Imba.mount <App counter=0>
```

Taking this one step further, since binding events is such an integral part of developing web applications, Imba has a special syntax for this. You can chain event handlers \(and modifiers -- see below\) directly:

```text
# increment handler will be called upon click
<button :click.increment>
# these can also take arguments
<button :click.increment(2)>
```

```text
tag App
    prop counter

    def increment
        counter++

    def change amount = 0
        counter += amount

    def render
        <self>
            <div> "count is {counter}"
            <button :click.increment> "Increment"
            <button :click.change(2)> "Increment by 2"

Imba.mount <App counter=0>
```

#### Event Modifiers

Inspired by Vue, Imba also supports modifiers. More often than not, event handlers are simple functions that do some benign thing with the incoming event \(stopPropagation, preventDefault etc\), and then continues on with the actual logic. By using modifiers directly where we bind to an event, our handlers never need to know about the event in the first place.

```text
# call preventDefault on the submit-event, then call doSomething
<form :submit.prevent.doSomething>
```

> What is the difference between a modifier and a handler in this case? There isn't really a difference. In fact, the modifiers are implemented as methods.

#### Key Modifiers

```text
# these can also take arguments
<input type='text' :keydown.enter.submit>
```

#### Reactivity

Let's move on to the next core part of Imba. Let's say we have a counter `hits`, and we want to render its value:

```text
let hits = 1
let view = <div>
    <span.counter> "Count is {hits}"
```

The view variable now refers to a div containing a span with the text "Count is 1". In web applications data change all the time, and if the value of `hits`changes, the view will _still_ read "Count is 1". Pretty pointless.

Enter reactive tags. There are two ways to create views that can update when your data changes. Custom tags will be introduced later in this guide. For now we can make the div reactive by ending the root tag with `->` or `=>`instead of `>`. If this seems confusing now, don't panic.

```javascript
let hits = 1
let view = <div ->
    <span.counter> "Count is {hits}"
```

Now, `view` is a reactive element, meaning that everything inside of it can be updated. Imba has ways to automate all of this for you, but for now you could manually call `view.render`to update the content. Imba is using a unique kind of reconciler to sync the view, which an order of magnitude faster than virtual doms.

### Data Binding

### Form Input Bindings

#### Self

What is self? Compare to react.

### State Handling

Language, not framework.

## Language

### Basics

Even though the syntax and semantics of Imba is much more related to Ruby than JavaScript, it does compile down to plain performant JavaScript, and is fully compatible with any existing JavaScript library. Imba does not extend any native types from JavaScript. Arrays are arrays, strings are strings, numbers are numbers, classes are constructors with prototypes and so forth. If you simply like Imba better, there is no reason not to write your npm package in Imba, even if it is supposed to be used in the general JavaScript ecosystem. In fact, Imba produces _very_ readable JavaScript, by keeping your indentation, comments, and coding style.

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

### Caveats

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

### Functions

There are two types of functions in Imba, _methods_ and _blocks_.

#### Methods

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

#### Blocks

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

### Classes

#### Declaration

```text
class Point
    def initialize x,y
        @x = x
        @y = y
```

#### Instances

To create instances of classes in Imba you use the `new` method like `Array.new`, as opposed to the special `new Array()` syntax in JavaScript. This is not special for classes created in Imba, but is used for creating any object, be it built in constructors in JavaScript like `Array`, `Object`, `RegEx` and any other class/constructor from other languages.

#### Properties

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

#### Inheritance

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

### Loops

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

### Tags

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

