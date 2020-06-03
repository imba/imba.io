# Styles & Theming

First things first; You are free to use external stylesheets like you've always done. Still, with a goal of being the friendliest language for creating web applications we have included styling as a core part of the language. We've also extended the functionality of css to make common patterns friendlier, and to make it easier to keep a consistent design language across your whole project.


Our approach to styling is inspired by [Tailwind](https://tailwindcss.com), so we recommend reading about [their philosophy](https://tailwindcss.com/docs/utility-first). Think of the style syntax in Imba as what Tailwind might be like if it was allowed to invent a language.

## Declaring styles

Global styles are declared using the `css` keyword

```imba
css .btn
    display: block;
    background: #b2f5ea;
    padding-left: 4px;
    padding-right: 4px;
# ... other code here
```
Besides using indentation instead of `{}` it looks very much like regular css. We staunchly believe that less code is better code, so we have strived to make the styling syntax as concise as possible, yet easily readable. Semi-colons are optional:

```imba
css .btn
    display: block
    background: #b2f5ea
    padding-left: 4px
    padding-right: 4px
```
The following parts might look messy on first glance, but bear with us. Line breaks are optional.

```imba
css .btn
    display:block background:#b2f5ea
    padding-left:4px padding-right:4px
```
While there is a case to be made against short variable names in general, css properties are static. We believe in providing short aliases for oft-used css properties.
```imba
css .btn
    d:block bg:#b2f5ea pl:4px pr:4px
```
These are consistent shorthands that will become second nature to write and read after only a very short period of using imba styles.

Styles can also be declared on a single line by separating the selector and the properties with `=`
```imba
css .btn ~arrow[=]~ d:block bg:#b2f5ea pl:4px pr:4px
```
This conciseness comes especially handy when declaring inline styles, which we will come back to later. The imba tooling also includes commands for quickly reformatting, reordering and cleaning up style blocks.

## Nested styles
Styles can also be nested. All nested selectors must include an `&` which represents the parent selector.
```imba
css .btn
    display: block
    background: #b2f5ea
    &:hover
        transform: translateY(-2px) scale(1.1)
    &.primary
        background: #0000FF
        &:hover
            background: #0000CD
```
Nested styles support the same compact syntax, so the rules above could be written like this:
```imba
css .btn = d:block bg:#b2f5ea hover.y:-2px hover.scale:1.1
    &.primary = bg:#0000FF hover.bg:#0000CD
```
Now, what are those `hover.` properties?

## Property modifiers

Styles can also be nested for convenience:
```imba
css .btn = bg:gray100 font-weight:600 px:2 py:1
    &.primary = bg:blue200 color:blue800 color.hover:blue900 bg.hover:blue300
	&.dangerous = bg:red200 color:red800 color.hover:red900 bg.hover:red300

# ... other application code here
```


## Scoped Styles

## Inline Styles

# Style Modifiers

# Colors

# Layout

# Sizing

# Typography

# Transitions

# Transforms