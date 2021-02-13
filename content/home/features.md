# Tags

```imba
# [preview=inline]
import 'util/styles'
css section div
	d:block rd:sm bg:sky3 w:auto h:auto
	tween:all 0.1s ease-in-out
yes
const api = new class
	def login user,pass
		await new Promise do setTimeout($1,800)
		return true

# ---
tag Login < form
	def handler
		log 'logging in'
		await api.login(name,secret)

	<self @submit.prevent.flag-busy=handler>
		<input type='text' bind=name>
		<input type='password' bind=secret>
		<button disabled=(!name or !secret)> 'Login'
# ---
imba.mount <Login[pos:abs inset:0 d:grid ja:center]>
# ~my-widget~ define web components
# ~form~ inherit from native tags
# ~.prevent~ convenient event modifiers
# ~bind~ two-way data-binding
```

This is some text right here about this awesome thing

# Grids

```imba
# [preview=xl]
css section div
	d:block rd:sm bg:sky3 w:auto h:auto
	tween:all 0.1s ease-in-out

imba.mount do <div[pos:abs inset:0 d:grid ja:center]>
	# ---
	<section[d:hgrid ja:stretch g:2 size:120px]>
		<div[bg:green2]>
		<div[bg:orange3]>
		<div[bg:red3 h:2rows y:6px]>
		<div[bg:indigo3 bg@hover:pink4]>
		<div[bg:teal2]>
# ~d:hgrid~ predefined layouts
# ~bg:teal2~ color presets
# ~6px~ style individual transform properties
# ~@hover~ inline state variants
```

# Pane with divider
```imba
# [preview=inline]
import 'util/styles'


# ---
tag Panel
	prop split = 70

	<self[d:flex pos:abs inset:6 rd:md of:hidden]>
		<div[bg:teal2 flex-basis:{split}%]>
		<div[fls:0 w:2 bg:teal3 @touch:teal5]
			@touch.prevent.pin.fit(self,0,100,2)=(split=e.x)>
		<div[bg:teal1 flex:1]>

imba.mount <Panel>
```

# Event Modifiers

```imba
# [preview=xl]
import 'util/styles'
# css body bg:gray1
css drag-me
	d:block pos:relative p:3 m:1
	bg:white bxs:sm rd:sm cursor:default
yes
# ---
tag drag-me
	<self @touch.prevent.moved.sync(self)>
		css bg:white @touch:blue4
			scale:1 @touch:1.2
			x:{x} y:{y} rotate:{x}deg
		<span> 'drag me'

imba.mount <drag-me>
# ~touch~ pointer handler
# ~.sync~ update x,y coordinates of target
```

# Test

## Custom slider
```imba
# [preview=lg]
import 'util/styles'

css body > * w:50vw m:2 h:4 bg:blue3 pos:relative rd:sm
css .thumb h:4 w:2 bg:blue7 d:block pos:absolute x:-50% t:50% y:-50% rd:sm
css .thumb b x:-50% l:50% b:100% w:5 ta:center pos:absolute d:block fs:xs c:gray6

tag slider
	prop min = -50
	prop max = 50
	prop step = 1
	prop value = 0

	<self @touch.fit(min,max,step)=(value = e.x)>
		<.thumb[l:{100 * (value - min) / (max - min)}%]> <b> value

imba.mount do <>
	<slider min=0 max=1 step=0.25>
	<slider min=-100 max=100 step=1>
	<slider min=10 max=-10 step=0.5>
```