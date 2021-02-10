import 'util/styles'

css body > * w:50vw m:2 h:4 bg:blue3 pos:relative rd:sm
css .thumb h:4 w:2 bg:blue7 d:block pos:absolute x:-50% t:50% y:-50% rd:sm
css .thumb b x:-50% l:50% b:100% w:5 ta:center pos:absolute d:block fs:xs c:gray6

# ---
tag Slider
	prop min = -50
	prop max = 50
	prop step = 1
	prop value = 0

	<self @touch.fit(min,max,step)=(value = e.x)>
		<.thumb[l:{100 * (value - min) / (max - min)}%]> <b> value

imba.mount do <>
	<Slider min=0 max=1 step=0.25>
	<Slider min=-100 max=100 step=1>
	<Slider min=10 max=-10 step=0.5>