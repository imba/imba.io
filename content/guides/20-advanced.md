---
title: Advanced guides
multipage: true
---

# Lifecycle

[Article](/articles/lifecycle.md)

# Routing

# Custom Events

[Article](/articles/special-events.md)

# Scheduling

# Using Decorators

[Article](/articles/decorators.md)

# Server-Side Rendering

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

tag app-item
	def render
		<self.bg-white.rounded-lg.p-6 :md.flex>
			<img.wh-16.rounded-full.mx-auto :md.wh-24.mx-0.mr-6 src="avatar.jpg">

			<div>
				<h2.text-lg> "Erin Lindford"
				<div.purple-500> "Customer Support"
				<div.gray-600> "erinlindford@example.com"
				<div.gray-600> "(555) 765-4321"

tag my-component
    def render
        <self>
            <div.one.two title='hello'> "Hello there"
            <>
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