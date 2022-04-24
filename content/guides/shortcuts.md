# Keyboard Shortcuts

To make it easier to add consistent shortcuts throughout your apps, Imba includes a custom [@hotkey](api) event. Behind the scenes it uses the [mousetrap.js](https://craig.is/killing/mice) library. See the [@hotkey](/api/Element/@hotkey) documentation.

Let's say we have a button that plays/pauses a video whenever it is clicked.
```imba
<button @click=togglePlayback> "Play/pause"
```
If we want to allow users to toggle playback using the spacebar, we can simply add a hotkey listener and pass in the keycombo we want it to respond to.
```imba
<button @hotkey('space') @click=togglePlayback> "Play/pause"
```
When a hotkey listener does not have a handler, it defaults to executing a click on the element. So this should be enough to allow playing/pausing by pressing the spacebar.

A hotkey will be active as long as the element with the listener is attached to the document. This makes it very easy to conditionally enable certain hotkeys in a declarative manner.

```imba
tag App
    <self>
        if let item = state.selection
            <div[d:none]
                @hotkey('del')=deleteItem(item)
                @hotkey('enter')=editItem(item)
                @hotkey('esc')=(state.selection = null)
            >
```
In the example above we add a hidden div to the dom if there is a selItem, and add three hotkey handlers to this element. So, whenever `app.selItem` is set, pressing `enter` will trigger the `editItem(selItem)` handler.

For hotkey groups and disabling/enable all hotkeys within a certain dom tree see the [Element.hotkeys](/api/Element/hotkeys) property.