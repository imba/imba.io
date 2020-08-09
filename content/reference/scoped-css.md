# scoped css

If you declare style rules inside tags they will only apply to elements inside of this tag.

### Basic scoped styles [preview=lg]
```imba
# these are global -- applies to everything in project
# ---
tag app-card
    css fs:sm radius:md d:vflex bg:teal1 c:teal7
    css .header bg:teal2/50 p:3
    css .body p:3

    <self>
        <.header> "Card Header"
        <.body> <p> "Card Paragraph"

tag app-root
    # local styles does not leak into app-card
    css .header bg:green3 p:4 fw:600

    <self>
        <.header> "App Header"
        <app-card>
        <app-card>
# ---
imba.mount do <app-root[d:grid gap:4 p:4]>
```
Any style you declare in a tag declaration will only ever affect the literal tags inside the declaration. You don't need to worry about affecting styles of deeply nested elements that might share the same class names. This is very practical, and allows us to safely use short and descriptive class names like `header`, `footer`, `body`, `content` etc, and use them for styling. Scoped styles are also inherited when extending components, which makes it very powerful.


### Overriding and inheriting styles [preview=lg]
```imba
import 'util/styles'
# these are global -- applies to everything in project
css @root ta:center
# ---
tag base-item
    css d:block m:2 p:3 bg:gray2
    css h1 fs:lg fw:600 c:purple7
    <self>
        <h1> "Heading"
        <p> <slot> "Description"

tag pink-item < base-item
    css bg:pink2
    css h1 c:pink7

tag custom-item < pink-item
    <self>
        <h1> "Heading"
        <p[fw:bold]> <slot> "Description"
        <div> "Show more..."

imba.mount do <div>
    <base-item> "Base item"
    <pink-item> "Pink item"
    <custom-item> "Custom item"
```