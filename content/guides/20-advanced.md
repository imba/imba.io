---
title: Advanced guides
multipage: true
---

# Lifecycle

[Article](/articles/lifecycle.md)

# Routing

# Scheduling

# Using Slots

# Server-Side Rendering

# Testing your app

> Show flag decorator that adds/removes flag

# Context API

> Include example that shows editing toggler

> Go through usecases -- like declaring `api/store/something` getter for all tags, that uses the context api.

> Why it is crucial in SSR

```imba
tag app-avatar

tag app-root

```

# Custom Decorators

# Custom Prop Modifiers

If you set `<element myname.prop1.prop2=value >` how do you actually access the modifiers? As we've learned, properties in tags are essentially compiled to plain setters, so `<div title='hi'>` is like `let div = document.createElement('div'); div.title = 'hi';`

> If you set `<element myname.prop1.prop2=value >` how do you actually access the modifiers?

# Highlighting

```imba
class Hello

    def test?
        yes

    def render param
        param
        other
        Math.random()
        hello.there
        self

tag my-component
    def render
        <self>
            <div.one.two title='hello'> "Hello there"
            <ul> for item in array
                <li[item]> item.name
```
Hello

```imba
# light

class Hello

    prop name\string

    def render param
        param
        other
        Math.random()
        hello.there
        self

tag my-component
    def render
        <self>
            <div.one.two title='hello'> "Hello there"
            <ul> for item in array
                <li[item]> item.name
```