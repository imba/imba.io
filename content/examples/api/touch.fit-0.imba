# [preview=lg]
import 'util/styles'
css .rect w:calc(100vw - 80px)
# ---
tag Unfitted
	<self @touch=(x=e.x)> "window.x {x}"
tag Fitted
	<self @touch.fit(self)=(x=e.x)> "box.x {x}"
tag Snapped
	<self @touch.fit(self,2)=(x=e.x)> "box.x {x}"

imba.mount do <>
	<Unfitted.rect>
	<Fitted.rect>
	<Snapped.rect>
###
This is a shared comment here
###