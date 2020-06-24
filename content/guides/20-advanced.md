---
title: Advanced guides
multipage: true
---

# Routing

# Scheduling

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

# Custom Prop Modifiers

If you set `<element myname.prop1.prop2=value >` how do you actually access the modifiers? As we've learned, properties in tags are essentially compiled to plain setters, so `<div title='hi'>` is like `let div = document.createElement('div'); div.title = 'hi';`

> If you set `<element myname.prop1.prop2=value >` how do you actually access the modifiers?