To ease development Imba adds a few non-standard events to get rid of boilerplate when you want to set up IntersectionObservers, MutationObservers, ResizeObservers, and selections inside input elements.

## Intersect

[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is a [well-supported](https://caniuse.com/#feat=intersectionobserver) API in modern browsers. It provides a way to asynchronously observe changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. In Imba it is extremely easy to set up an intersection observer.

| Event Properties  |  |
| --- | --- |
| `event.entry` | Returns the [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) |
| `event.ratio` | Returns the ratio of the intersectionRect to the boundingClientRect |
| `event.delta` | Difference in ratio since previous event |


##### in-modifier
```imba
// Will only trigger when element starts intersecting
<div @intersect.in=handler>
// Will only trigger when element is more than 50% visible
<div @intersect(0.5).in=handler>
```

##### out-modifier
```imba
// Will only trigger when element starts intersecting
<div @intersect.out=handler>
// Will trigger whenever any part of the div is hidden
<div @intersect(1).out=handler>
```

[Example](/examples/intersect-event)

## Resize

The [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) interface reports changes to the dimensions of an Element's content or border box. It has [decent browser support](https://caniuse.com/#feat=resizeobserver) and is very useful in a wide variety of usecases. ResizeObserver avoids infinite callback loops and cyclic dependencies that are often created when resizing via a callback function. It does this by only processing elements deeper in the DOM in subsequent frames.

| Event Properties  |  |
| --- | --- |
| `event.entry` | Returns the [ResizeObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry) |
| `event.rect` | A DOMRectReadOnly object containing the new size of the observed element when the callback is run. |

[Example](/examples/resize-event)

## Selection

## Mutation
