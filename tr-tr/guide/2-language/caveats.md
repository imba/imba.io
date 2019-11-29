---
title: Caveats
order: 2
---

# Caveats

If you are coming from JavaScript, there are a few things you really need to know when learning Imba. Imba is not like CoffeeScript, in the sense that it does not try to just be a slightly different dialect of JavaScript. Imba compiles to javascript, but the syntax and semantics affects how you structure your code.

If you are not familiar with ruby, many parts of Imba will probably seem slightly confusing until you understand the concepts of implicit self and implicit calling. Any lowercase identifier that is not explicitly declared as a variable is treated as an implicit call on the `self` of the current scope. The analyzer / highlighter will help by highlighting variables differently.

## Implicit self

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

### extern

```text
extern something
something
```

### self vs this

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

## Implicit invocation

In Imba you are invoking methods with the regular dot-operator. In JavaScript `car.start` will access the `start` property of car. In Imba it will actually _invoke_ the `start` method of car. Parenthesis are optional. You can read more about the reasons for this \[here\]. If you're thinking in JavaScript, this might seem impractical and confusing. The same behaviour can be seen in languages like Ruby.

So, how do we access properties then? You can do it with `car['start']`, just like in JavaScript. Since accessing properties are still used quite a lot when dealing with external libraries written in JavaScript, we also have a shorthand for this, using the unspaced colon-operator `car:start`. For fresh users, this can cause some headache, but after a few hours of coding it will become second nature.

> If you end up using `object:access` repeatedly in your Imba code, it is very likely because you are thinking in JavaScript. In Imba, a class should only expose information and behaviour through methods.

Unlike Ruby, Imba has implicit setters as well. Since all variables are explicitly declared in Imba, assigning to something that is not declared is just seen as any other method. `name = 1` resolves to a setter, and compiles

## Arguments

The arguments of a method can be accessed through the special `$0`. Each individual argument can be accessed through `$n`, where n is the argument number, starting from 1.

```text
def method
    $0 # -> arguments
    $1 # -> arguments[0]
    $2 # -> arguments[1]

# sometimes practical for inline methods
var doubles = [1,2,3].map do $1 * 2
```

