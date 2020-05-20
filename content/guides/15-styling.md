---
title: Styling
multipage: true
---

# Introduction

You are free to use external stylesheets like you've always done. In addition, Imba has a custom syntax for adding styles to elements and components.

CSS-like syntax. Allows writing powerful styles inline in your templates, and later extract repeating patterns into style rules. Inspired by tailwind. The full power of css at your fingertips.

Imba is essentially a DSL for creating web applications. We have extended css with a few concepts to ease development of common patterns. Expose all of css, but make it easy to create consistent layouts with core theme like tailwind.

Since the approach for styling in imba is very much inspired by Tailwind, we can recommend reading about [their philosophy](https://tailwindcss.com/docs/utility-first). Think of the style syntax in Imba as what Tailwind might be like if it was allowed to invent a language.

> Property separators are optional

## Inline styles

You can add inline styles on any element using `.(properties)` syntax. You can think of this as an inlined anonymous class with a bunch of css properties.
So instead of coming up with an arbitrary class name and adding styles somewhere else, you can simply add them to an element directly:
```imba
<div.(position:relative display:flex flex-direction:row padding:2rem)>
```
This might look like regular inline styles, but as you will learn later in this guide they come with some incredible superpowers. With consistently named aliases and shorthand properties writing styles like this will become second nature:

```imba
<div.(l:rel vflex p:2rem)>
```
All of this can also be combined with property modifiers, to set certain properties only on hover, or for certain viewport sizes and more:
```imba
# More padding on large screens:
<div.(l:rel vflex p:2rem p.lg:3rem)>
# Darker background color on hover:
<button.(bg:gray-200 bg.hover:gray-300)>
# Set text color when input is focused:
<input.(color.focus:blue-700)>
```
We will cover all these property modifiers in later chapters.

## Scoped styles

You might find yourself repeating some styles multiple times inside your components. Also, if an element has a *ton* of inline styles it might make sense to extract.

```imba
import {pages} from './data.imba'

# ---
tag app-panel
    prop page

    <self>
        <header.(p:3 color:gray600 l:flex font-size:sm)> for item in pages
            <div
                .(cursor:pointer mx:1 py:1 px:2 radius:2 color:gray500 color.hover:gray600 bg:gray200)
                .(color:blue500 bg:blue100)=(page == item)
                @click=(page=item)
            > item.title
        <section> "..."

imba.mount <app-panel>
```

In the example above we have a bunch of headers that are essentially sharing the same style. This makes sense to pull out. We don't really want to pollute the global css with yet another rule, but we can easily declare a style that matches selectors only inside the app-panel component:

```imba
import {pages} from './data.imba'

# ---
tag app-panel
    prop page

    css .tab
        cursor:pointer mx:1 py:1 px:2 radius:2
        color:gray500 color.hover:gray600 bg:gray200
        &.active = color:blue500 bg:blue100

    <self.(l:flex)>
        <header.(p:3 color:gray600 l:flex font-size:sm)> for item in pages
            <div.tab .active=(page == item) @click=(page=item)> item.title
        <section> "..."

imba.mount <app-panel>
```

## Global styles

When you eventually see app-wide patterns emerge you can add global styles that affect elements across the whole project.

```imba
css .btn = bg:gray-100 font-weight:600 px:2 py:1
css .btn.primary = bg:blue200 color:blue800 color.hover:blue900 bg.hover:blue300
css .btn.dangerous = bg:red200 color:red800 color.hover:red900 bg.hover:red300
# ... other application code here
```

Styles can also be nested for convenience:
```imba
css .btn = bg:gray100 font-weight:600 px:2 py:1
    &.primary = bg:blue200 color:blue800 color.hover:blue900 bg.hover:blue300
	&.dangerous = bg:red200 color:red800 color.hover:red900 bg.hover:red300

# ... other application code here
```

> More details about the syntax of these styles. Delimiters, indent etc.

## Aliases

# Colors

```imba
css .item
    # all regular pseudo-classes are supported as modifiers
    prop.hover: value # .item:hover { prop: value }
    prop.focus: value # .item:focus { prop: value }
```

## Default Palette

<doc-colors></doc-colors>

## Semi-transparent versions

## Customizing colors

# Modifiers

## Pseudo class modifiers

All regular pseudo classes are supported as modifiers, as well as a few convenient aliases


##### Pseudo-class modifiers
```imba
css .item
    # all regular pseudo-classes are supported as modifiers
    prop.hover: value # .item:hover { prop: value }
    prop.focus: value # .item:focus { prop: value }
    prop.checked: value # .item:empty { prop: value }
    prop.invalid: value # .item:empty { prop: value }
    prop.empty: value # .item:empty { prop: value }

    # and some practical shorthands/aliases
    prop.even: value # .item:nth-child(even) { prop: value }
    prop.odd: value # .item:nth-child(odd) { prop: value }
    prop.first: value # .item:first-child { prop: value }
    prop.last: value # .item:last-child { prop: value }
    prop.lone: value # .item:only-child { prop: value }
```

##### Responsive modifiers
```imba
css .item
    # breakpoints for various device widths
    padding.xs: 1 # @media (min-width: 480px) { .item{ padding:0.25rem } }
    padding.sm: 2 # @media (min-width: 640px) { .item{ padding:0.5rem } }
    padding.md: 3 # @media (min-width: 768px) { .item{ padding:0.75rem } }
    padding.lg: 4 # @media (min-width: 1024px) { .item{ padding:1rem } }
    padding.xl: 5 # @media (min-width: 1280px) { .item{ padding:1.25rem } }

    # different styles for print and screen
    margin.print: 8 # @media print { .item{ margin: 2rem } }
    margin.screen: 0 # @media print { .item{ margin: 0rem } }

    # or for the preferred color scheme of visitor
    bg.dark: black # @media (prefers-color-scheme: dark) { .item{ ... }  }
    bg.light: white # @media (prefers-color-scheme: light) { .item{ ... }  }
```

##### Chaining modifiers
```
# All modifiers can be chained
css .item
    bg.focus.hover: whitesmoke # { .item:focus:hover { background: whitesmoke } }
    padding.md.empty: 4 # @media (min-width: 768px) { .item:empty { padding:1rem } } 
```

## Adding custom breakpoints



Listing modifiers

```css
<div class="sidebar-inner-wrapper">...</div>

.sidebar-inner-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center
}
```

```imba
<div.(l:rel vflex ai:center)> "..."
```

At first this will look unfamiliar and cryptic, but these consistent shorthand aliases for common properties will soon become second nature. Remember that you can still 

# Theming

The goal is to make the defaults good enough so that you will only ever want to change the colors.

## Colors

## Breakpoints

## Fonts

## Sizing


# Layout

A single property that accepts values describing various common combinators of position, display, overflow, and other properties. Here is a list of all the values layout accepts - and what they are shorthands for:

```imba
abs # position: absolute;
rel # position: relative;
fixed # position: fixed;
sticky # position: sticky;
static # position: static;
hidden # display: none;
block # display: block;
inline-block # display: inline-block;
inline # display: inline;
flex # display: flex;
inline-flex # display: inline-flex;
vflex # display: flex; flex-direction: row;
inline-vflex # display: inline-flex; flex-direction: row;
grid # display: grid;
inline-grid # display: inline-grid;
grid # display: grid;
table # display: table;
table-caption # display: table-caption;
table-cell # display: table-cell;
table-column # display: table-column;
table-column-group # display: table-column-group;
table-footer-group # display: table-footer-group;
table-header-group # display: table-header-group;
table-row-group # display: table-row-group;
table-row # display: table-row;
contents # display: contents;
clip # overflow: hidden;
noclip # overflow: visible;
clip-x # overflow-x: hidden;
clip-y # overflow-y: hidden;
noclip-x # overflow-x: visible;
noclip-y # overflow-y: visible;
scroll-x # overflow-x: auto;
scroll-y # overflow-y: auto;
scroll # overflow: scroll;
border-box # box-sizing: border-box;
content-box # box-sizing: content-box;
inset # top: 0; left: 0; bottom: 0; right: 0;
visible # visibility: visible;
invisible # visibility: hidden;

```

| Value  | Properties |
| --- | --- |
| `abs` | `position: absolute;` |
| `rel` | `position: relative;` |
| `fixed` | `position: fixed;` |
| `sticky` | `position: sticky;` |
| `static` | `position: static;` |
| `hidden` | `display: none;` |
| `block` | `display: block;` |
| `inline-block` | `display: inline-block;` |
| `inline` | `display: inline;` |
| `flex` | `display: flex;` |
| `inline-flex` | `display: inline-flex;` |
| `vflex` | `display: flex; flex-direction: row;` |
| `inline-vflex` | `display: inline-flex; flex-direction: row;` |
| `grid` | `display: grid;` |
| `inline-grid` | `display: inline-grid;` |
| `grid` | `display: grid;` |
| `table` | `display: table;` |
| `table-caption` | `display: table-caption;` |
| `table-cell` | `display: table-cell;` |
| `table-column` | `display: table-column;` |
| `table-column-group` | `display: table-column-group;` |
| `table-footer-group` | `display: table-footer-group;` |
| `table-header-group` | `display: table-header-group;` |
| `table-row-group` | `display: table-row-group;` |
| `table-row` | `display: table-row;` |
| `contents` | `display: contents;` |
| `clip` | `overflow: hidden;` |
| `noclip` | `overflow: visible;` |
| `clip-x` | `overflow-x: hidden;` |
| `clip-y` | `overflow-y: hidden;` |
| `noclip-x` | `overflow-x: visible;` |
| `noclip-y` | `overflow-y: visible;` |
| `scroll-x` | `overflow-x: auto;` |
| `scroll-y` | `overflow-y: auto;` |
| `scroll` | `overflow: scroll;` |
| `border-box` | `box-sizing: border-box;` |
| `content-box` | `box-sizing: content-box;` |
| `inset` | `top: 0; left: 0; bottom: 0; right: 0;` |
| `visible` | `visibility: visible;` |
| `invisible` | `visibility: hidden;` |

All of these values can be combined 

# Flexbox

| Aliases  |  |
| --- | --- |
| `ai` | align-items |
| `as` | align-self |
| `ac` | align-content |
| `jc` | justify-content |

## Align Items

## Align Content

## Align Self

## Justify Content

## Flex

## Flex Grow

## Flex Shrink

# Grid

# Sizing

Units, shorthands++

## Padding

| Aliases  | Properties |
| --- | --- |
| `p` | padding |
| `pl` | padding-left |
| `pr` | padding-right |
| `pt` | padding-top |
| `pb` | padding-bottom |
| `px` | padding-left & padding-right |
| `py` | padding-top & padding-bottom |


## Margin

| Aliases  | Properties |
| --- | --- |
| `m`  | margin |
| `ml` | margin-left |
| `mr` | margin-right |
| `mt` | margin-top |
| `mb` | margin-bottom |
| `mx` | margin-left & margin-right |
| `my` | margin-top & margin-bottom |

## Space between

# Typography

```imba
css h1
    text: bold sm/2 sans
```

## Font Family

Default fonts defined in theme
How to add / change fonts

| Fonts  |  |
| --- | --- |
| `sans`  | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"` |
| `serif` | `Georgia, Cambria, "Times New Roman", Times, serif` |
| `mono` | `Menlo, Monaco, Consolas, "Liberation Mono", "Courier New"` |

## Font Size

| Aliases  |  |
| --- | --- |
| `xxs`  | 10px |
| `xs`   | 12px |
| `sm`   | 14px |
| `md`   | 16px |
| `lg`   | 18px |
| `xl`   | 20px |
| `2xl`  | 24px |
| `3xl`  | 30px |
| `4xl`  | 36px |
| `5xl`  | 48px |
| `6xl`  | 64px |

## Colors and Sizing

An application can quickly become an entangled mess of competing css rules, different shadows, colors, and sizes. We don't want to force developers into a hardcoded set of predefined styles, but we do want to make it easy to keep styles consistent within your project.

## Inline styles

Inline styles with superpowers. When using inline styles, how would you ever set 

There are some very common usecases that are pretty verbose to express in regular css. You want to have different font sizes for different screen sizes. You want to slightly change the color or opacity of a background on hover.

## text property

# Backgrounds

# Borders

## Border

## Divide

# Transitions

# Transforms

# Breakpoints

