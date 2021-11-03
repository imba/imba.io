# /api/imba/commit

This is some details about imba.commit right here. Might want to put it in the typings instead?

# /api/Element/@hotkey

To make it easier to add consistent shortcuts throughout your apps, Imba includes a custom [@hotkey](api) event. Behind the scenes it uses the [mousetrap.js](https://craig.is/killing/mice) library.

### Syntax

```imba
# supply the key combo in the @hotkey(arguments)
<div @hotkey('ctrl+shift+k')=handler>
# gmail style sequences
<div @hotkey('g i')=handler>
<div @hotkey('g a')=handler>
# hotkey without a handler defaults to click
<div @hotkey('mod+n') @click=clickHandler>
# hotkey without a handler on a form field will focus
<input @hotkey('s') placeholder="Search...">
```

### Usage

For multiple elements with the same hotkey - the ones later in the dom will be called first - and always stop there unless the handlers have set the `.passive` modifier.

```imba
<div @hotkey('f').passive.log('not called')>
<div @hotkey('f').log('called next - stops here')>
<div @hotkey('f').passive.log('called first')>
```

Hotkeys are only active when / if they are present in the dom. This makes it very easy to conditionally enable certain hotkeys in a declarative manner.

```imba
tag App
    <self>
        # ...
        selItem && <div[d:none]
            @hotkey('del')=deleteItem(selItem)
            @hotkey('enter')=editItem(selItem)
            @hotkey('esc')=(selItem = null)
        >
```
In the example above we add a hidden div to the dom if there is a selItem, and add three hotkey handlers to this element. So, whenever `app.selItem` is set, pressing `enter` will trigger the `editItem(selItem)` handler.

For hotkey groups and disabling/enable all hotkeys within a certain dom tree see the [Element#hotkeys](api) property.


# /css/properties/hue

In addition to the default [built in colors](/css/colors), `hue0`,`hue1`,`...`,`hue9` refers to the color scale set by the `hue` property. Setting `hue:amber` in css, will make `hue2` refer to `amber2` inside all elements that are affected by this style. The `hue(n)` color values supports an alpha value with the forward-slash syntax like `hue4/40`

### Syntax
```imba
<div[hue:violet color:hue4]>
```

### Usage

Let's say you have a button component with some basic styles:
```imba
# [preview=md]
import 'util/styles'
global css body d:hflex ja:center inset:0
# ---
tag Button
    css px:4 py:2 rd:md cursor:pointer c:white
        text-shadow:0px 1px blue8/70
        bg:blue5 @hover:blue6
        bd:1px solid blue6

    <self> <span> <slot>

imba.mount do <Button> "Button"
```
This is all fine, but what if you want to also have a red button, and a green button? Duplicating all the styles involving colors is impractical, especially if you change the design of the button later. With `hue`, we can replace `blue2` with `hue2`, `blue8/70` with `hue8/70` and so on. Then we can set the color scale using the `hue` property.

```imba
# [preview=md]
import 'util/styles'
global css body d:hflex ja:center inset:0
# ---
tag Button
    css px:4 py:2 rd:md cursor:pointer c:white
        text-shadow:0px 1px hue8/70
        bg:hue5 @hover:hue6
        bd:1px solid hue6
        
    <self> <span> <slot>

imba.mount do <>
    <Button[hue:blue]> "Button"
    <Button[hue:red]> "Button"
    <Button[hue:green]> "Button"
    <Button[hue:amber hue@hover:purple]> "Hover me"
```
