# Imba

# - commit [href=/api/imba/commit]

# - mount [href=/api/imba/mount]

# - unmount [href=/api/imba/unmount]

# - render [href=/api/imba/render]

# - serve [href=/api/imba/serve]


# DOM

Hello

# - Element [href=/api/Element]

<app-reference-page></app-reference-page>

# - Component  [href=/api/ImbaElement]

# - Events

# - Router [href=/api/imba/Router]

# - Scheduler [href=/api/imba/Scheduler]


# CSS

# - Properties

Imba supports all regular css properties. For a full reference on all css properties we recommend visiting the MDN docs. There are some custom properties and shorthands added in Imba that are very valuable. There are also a configurable design system (inpsired by Tailwind) built in. Among other things, this features non-standard values for [box-shadow](css), [border-radius](css), [transition-timing-function](css), as well as [color](css) palettes. The custom [hue](css) property is especially useful..

<api-styleprop-list></api-styleprop-list>

# - Modifiers

Modifiers are css [pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes) with superpowers. They can be used in selectors wherever you would normally use a pseudo-class. All css pseudo-classes are available as modifiers, but Imba offers additional modifiers to make responsive styling easy, as well as a ton of other convenient modifiers you can read about further down. See the [guide](/css/syntax#modifiers) for additional details.

### Syntax

```imba
# in selectors
css button@hover
    bg:blue
# in properties
css button
    bg@hover:blue
# after properties
css button
    bg:white @hover:whitesmoke @focus:blue
```

### Class Modifiers

Classes can also be used as modifiers:

```imba
css button c:white bg.primary:blue
# is the same as
css button c:white
    .primary bg:blue
```

## Reference

### Media Modifiers

<api-stylemod-list data-group="media"></api-stylemod-list>

### Breakpoints

<api-stylemod-list data-group="breakpoint"></api-stylemod-list>

### Pseudo-classes

<api-stylemod-list data-group="pseudoclass"></api-stylemod-list>

### Pseudo-elements

<api-stylemod-list data-group="pseudoelement"></api-stylemod-list>

### Special Modifiers

<api-stylemod-list data-group="custom"></api-stylemod-list>

# - Units

# - Colors