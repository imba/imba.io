---
title: Tips
---

# Implicit self

Just like Ruby, Imba has implicit self and implicit calling. This means that something like `hello` will compile to `self.hello()` in Imba. Calls are also implicit, so `hello.world` is equivalent to `self.hello().world()`.

## Implicit self

```text
# as long as hello is not declared in the scope
# it will evaluate to self.hello(), which throws an error 
hello

# lets declare a variable and then do the same
# this time 'hi' will evaluate to a simple variable lookup
var hi = 'Hi!'
hi # exists in scope
```

## Implicit call / parenthesis

To access keys instead of calling we can use `object['key']` just like in js. But since we are so used to using direct accessors a lot when dealing with other js libraries etc, imba also has a shorthand syntax for access.

## Call vs access

```text
# we define an item
var item = {name: 'Hello'}

# whoops! remember that Imba has implicit parenthesis / calling
# like ruby. this will evaluate to item.name() which throws an error
# since name is not a function
item.name

# if we want to access the key without calling
# we can use the index syntax we know from js
item['name']

# since we are so used to using direct accessors quite a lot
# when dealing with other js libraries etc, imba also has
# a shorthand way to get keys using colon
item:name
```

## What about global variables?

```text
# if hello throws an error in the example above,
# what happens when we try to access window?
window # phew - no error

# as you can see from the highlighting, window resolves
# to a variable, not an implicit call (this.window())
# this is because window is predefined as a global variable
# along with document, process, setTimeout, setInterval,
# clearTimeout, clearInterval, parseInt, parseFloat, __dirname
```

Variables must be predeclared \(unlike Ruby and Python\). This gives you very finegrained control over variable access.

## Levels of scoping

```text
# top level
var top = 1

class Todo
    # class scope
    # implicit context / self is the class
    var items = []

    # class-method
    def self.build
        # method scope
        # self is the class
        self

    # instance-method
    def complete
        # method scope
        var context = self # todo instance

        if true
            # block scope
            ok

        save do
            # anonymous scope
            # context is bound to the closest declared scope
            context == self # true 

        return context
```

```text
var outer = 1
var completed = 0

class Todo

    def label name
        @labels.push name

    def inspect
        @labels.map do |label|
            # self still refers to the todo
            self

    def complete
        # completed is
        completed++
```

## Implicit calling

```text
# methods are declared scopes
def action
    # local variables acts just like in JavaScript
    var inner = 1
    outer += inner
    inner = 2

    # value is _not_ a variable in scope
    value # -> this.value()
    value = 1

    # you can also explicitly use self
    self.value
    self.value = 10 # -> this.setValue(10)

    # Since Imba requires all variables to be declared,
    # setters are also implicit. value is not a variable
    # so it evaluates to this.setValue(2)
    value = 2

let organisms = 0 # count of all organisms

class Human
    let humans = 0 # count of all humans

    prop age

    def initialize
        humans++
        organisms++ # in global scope
        age = 0 # property setter
```

To make it even easier to see whether things are variables or implicit calls, Imba will highlight local variables differently in the web-based editor the offical plugins for IDEs.

## block scoping

Variables can also be declared with the `let` keyword. Such variables will \(like in ES6\) be scoped to their block rather than their function/closure.

## let vs var

```text
var a = 5
var b = 10

if a === 5
  let a = 4 # The scope is inside the if-block
  var b = 1 # The scope is inside the function

  console.log(a) # 4
  console.log(b) # 1

console.log(a) # 5
console.log(b) # 1
```

## Using self explicitly

Remember that a lone identifier will resolve to a variable _if it exists in the scope_. Fear not though, the highlighter will make it clear whether an identifier resolves to a variable. In these cases, you need to use `self` explicitly.

```text
var engine = 1

class Car
    def engine
        @engine

    def ignite
        self

    def run
        ignite
        # throws error - engine resolves to a variable
        engine.start
        # this will call the engine method on Car as expected
        self.engine.start

        window # resolves to global variable window
        self.window # call window (and return @window)
```

