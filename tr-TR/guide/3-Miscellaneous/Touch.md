---
title: Mouse and Touch Events
order: 8
---

# Mouse and Touch Events

Consolidates mouse and touch events. Touch objects persist across a touch, from touchstart until end/cancel. When a touch starts, it will traverse down from the innermost target, until it finds a node that responds to ontouchstart. Unless the touch is explicitly redirected, the touch will call ontouchmove and ontouchend / ontouchcancel on the responder when appropriate.

```imba
tag DraggableItem
    # called when a touch starts
    def ontouchstart touch
        flag 'dragging'
        self

    # called when touch moves - same touch object
    def ontouchmove touch
        # move the node with touch
        css top: touch.dy, left: touch.dx

    # called when touch ends
    def ontouchend touch
        unflag 'dragging'

    # called if touch is cancelled
    def ontouchcancel touch
        unflag 'dragging'

```

> ontouchmove, ontouchend, and ontouchcancel do not bubble like regular events. The element on which ontouchstart was called will capture the touch, and all future events (move,end,cancel) will be called on that element.

- Explain what separate touch from regular events

> Even though touch-handlers are declared the same way as regular event handlers,

### Methods

#### `touch.extend(plugin)`

Extend the touch with a plugin / gesture. All events (touchstart,move etc) for the touch will be triggered on the plugins in the order they are added.

Example

#### `touch.x`

Horizontal position of touch

#### `touch.y`

Vertical position of touch

#### `touch.dx`

The distance the touch has moved horizontally

#### `touch.dy`

The distance the touch has moved vertically

#### `touch.dr`

The absolute distance the touch has moved from starting position

#### `touch.button`

Button pressed in this touch. Native touches defaults to left-click
