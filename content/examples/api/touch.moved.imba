# [preview=md] [example=ImbaTouch.@moved]
import 'util/styles'
css .rect pos:absolute inset:4

# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	# won't trigger until moved 30px from start
	<self @touch.moved(30px)=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>