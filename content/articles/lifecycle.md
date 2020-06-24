## Lifecycle Hooks

These methods are meant to be defined in your components. In most cases you will only define a `render` method, and possibly `awaken` if you want to do some additional initialization when the element is first attached to the document.

| table  |  | |
| --- | --- | --- |
| `build` | Called before any properties etc are set | |
| `hydrate` | Called before awaken if element is not hydrated | |
| `dehydrate` | Called before serializing when rendering on server | |
| `awaken` | Called the first time the component is mounted | |
| `mount` | Called when the component is attached to the document | |
| `unmount` | Called when the component is detached from the document | |
| `render` | Called by both visit and tick | |
| `rendered` | Called after every `render` | |

## Lifecycle States

Components also has a bunch of methods that you can call to inspect where in the lifecycle a component is:

| table  |  |
| --- | --- |
| `hydrated?` | Is this element created on the client (by imba) or has it been rehydrated? |
| `awakened?` | Called the first time the tag is mounted |
| `mounting?` | Is component in the process of being mounted? |
| `mounted?` | Is component attached to the document? |
| `render?` | Should component render? |
| `rendered?` | Has component been rendered? |
| `scheduled?` | Is component scheduled? |

## Advanced Hooks

In some special cases you might want to go further and override the default behaviour of Imba.

| table  |  |
| --- | --- |
| `tick` | Called on every imba.commit when component is scheduled |
| `visit` | Called when parent element is rendered |
| `commit` | Called by both visit and tick |

## Hydration

- When will hydrate be called?
- When will dehydrate be called?

## Examples

##### Setup timer
```imba
tag app-clock
    def mount
        # call render every second
        $timer = setInterval(render.bind(self),1000)
    
    def unmount
        # remember to clear interval when tag unmounts
        clearInterval($timer)

    # if you _only_ want the clock to render via timer
    # and not when the parent element renders - we also
    # need to override visit
    def visit
        return
```
- Setting up a timer in mount and clearing it in unmount

##### Override visit
```imba
tag app-clock
    def visit
        commit! unless scheduled?
```

## More

- Would be nice to have a hook for doing things on the first mount only.
- Do something after the first render only?
- Clarify the order of things happening. When is render first called?
- Want one hook that is only called when 
- When are components _not_ scheduled?
- Explain visit, outer render, internal render, and the order
- Clock is a good example to step through many of the lifecycle states
- Add support for scheduling with timer and/or RAF