# Style Properties

Imba supports all regular css properties. For a full reference on all css properties we recommend visiting the MDN docs. There are some custom properties and shorthands added in Imba that are very valuable. There are also a configurable design system (inpsired by Tailwind) built in. Among other things, this features non-standard values for [box-shadow](css), [border-radius](css), [transition-timing-function](css), as well as [color](css) palettes. The custom [hue](css) property is especially useful..

## Flex Layout

#### Properties

<api-list>css.own.properties ^(flex)</api-list>

#### Display Values

<api-list>css.display.all ^[hv]?(flex)</api-list>

## Grid Layout

#### Properties

<api-list>css.own.properties ^(grid)</api-list>

#### Display Values

<api-list>css.display.all ^[vhlrtb]?(grid)</api-list>

## Alignment

<api-list>css.own.properties ^(place|align|justify)</api-list>

## Transforms

<api-list>css.own.properties.preferred transform</api-list>

## Easing

### Properties

<api-list>css.own.properties.preferred (^ease)|(^e[atocb]?[dfw]?$)</api-list>

## Non-standard Properties

<api-grid>css.own.properties.custom</api-grid>

## Standard CSS Properties

<api-grid>css.own.properties.native</api-grid>
