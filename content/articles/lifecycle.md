## Lifecycle Methods

### build

Called before any properties etc are set from outside.

> Q: Is this called for dehydrated elements as well?

### hydrate

Will be called when a component is awakened from the raw document

[Example](/examples/lifecycle-hydrate)

### awaken

Called the first time the component is mounted. 

### mount

Called when component is attached to the document.

### unmount

Called when the component is being detached from the document.

```imba
def unmount # default behaviour
    unschedule! if scheduled?
```

> If you override unmount - remember to unschedule the node if it is scheduled.

### render?

Returns whether we should render or not

### render

Called whenever element is scheduled to be rendered

### rendered

Called after every successful `render`.

### commit

Wrapper for rendering. Default implementation

```imba
def commit
    return self unless render?
    $rendering = true
    render!
    $rendering = false
    rendered!
    $rendered = true
    return self
```

### tick

Called by the scheduler when component is scheduled

```imba
def tick
    commit!
```


### visit

```imba
def visit
    commit!
```

Called when component is visited from the context in which it is rendered. Will simply call commit by default. If you have scheduled an element to update independently of when the parent is rendered it makes sense to override.

```imba
tag app-clock
    def visit
        commit! unless scheduled?
```

### hydrate

Called before awaken/mount mounting a component that was not created by the client inside imba. Ie. if your html has a 

> Add example showing rehydration
> Notice that components created through native `document.createElement` will also trigger rehydration

## Lifecycle States

### hydrated?

Is this element created via imba and on the client or has it been `rehydrated`?

### awakened?

Is true forever after the first mount

### mounted?

Is this currently mounted? 

### mounting?

Is this component currently in the process of mounting? Set to true before calling mount, and back to false afterwards.

### scheduled?

### rendered?

Returns true after the first full rendering cycle `render? -> render -> rendered` is completed.

## General

- Would be nice to have a hook for doing things on the first mount only.
- Do something after the first render only?
- Clarify the order of things happening. When is render first called?
- Want one hook that is only called when 
- When are components _not_ scheduled?