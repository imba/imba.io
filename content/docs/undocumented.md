# Undocumented

Imba is moving extremely quickly and documenting every feature
becomes challenging. We intend to continually revise the
documentation as much as possible, but instead of not documenting
features *at all* until we have time, it's better to at least
expose them to power users who want to learn as much as possible
at the cost of reading something slightly less structured and
polished as the rest of the docs.

This also serves as a list of things that need to be documented
more formally, which is better than having all of them in our
personal notes. Contributions are highly appreciated, especially:

- Polishing any of these examples or creating your own examples.
- Moving examples to a relevant location on the documentation.
- Coming up with proper names for ambiguous features.

If you have questions about any of these, don't hesitate to reach
out on [Discord](/disc).

## Custom Event Modifiers

```imba
const p = console.log

import * as fui from '@floating-ui/dom'

extend class Event

	def @confirm msg
		let view = <app-confirm anchor=target template=msg>
		p target
		imba.mount view
		view.promise

tag app-confirm

	anchor
	template
	promise = new Promise do #resolve = $1

	def confirm
		#resolve yes
		hide!

	def mount
		{ x, y } = await fui.computePosition(anchor, self)

	def reject
		#resolve no
		hide!

	def hide
		imba.unmount self
		self

	<self>
		css pos:absolute w:max-content top:{y}px left:{x}px
		<button @click=reject> 'Cancel'
		<button @click=confirm> 'OK'

tag app

	<self>
		<button@click.confirm.log('Confirmed!')> 'Click to confirm'

imba.mount <app>
```

## Style flags

```imba
global css .dark bg:black c:white

tag app
	def mount
		self.flags.add('dark')
	<self> 'manual flags'

imba.mount <app>
```imba
