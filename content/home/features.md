# Tags

```imba
# [preview=inline]
import 'util/styles'

const api = new class
	def login user,pass
		await new Promise do setTimeout($1,800)
		return true

# ---
tag Login < form

	def handler e
		await api.login(name,secret)

	css pos:abs inset:0 d:grid ja:center

	<self @submit.prevent.flag-busy=handler>
		<svg srcz='./logo.svg'>
		<input type='text' bind=name>
		<input type='password' bind=secret>
		<button disabled=(!name or !secret)>
			<span> `Login as {name}`
# ---
imba.mount <Login[pos:abs inset:0 d:grid ja:center]>
# ~Login|1,24.3,-38.6,50.0~ define web components
# ~css |1,-84.8,-58.9,50.0~ integrated styling
# ~submit|0,102.4,-122.7,50.0~ powerful event handling
# ~./logo.svg|0,151.5,-92.3,50.0~ auto-inlining svg assets
# ~bind|0,109.7,78.1,50.0~ two-way data-binding

css section div
	d:block rd:sm bg:sky3 w:auto h:auto
	tween:all 0.1s ease-in-out
```

Imba has been built over years striving to remove all friction from developing web apps. Tags, web components, styles and assets are all first-class citizens of the Imba programming language.


# Ecosystem

```imba
import express from 'express'
import passport from 'passport'
import services from './services.ts'

const app = express()

app.get '/404' do(req,res)
	res.send String <html> <body>
		<img src='./confused-cat.png'>
		<h1> "We could not find this page!"

app.get '/' do(req,res)
	let page = import('./index.html')
	res.send page.body
# ~express|1,-13.6,-42.0,50.0~ whole js ecosystem
# ~body|0,93.4,-67.4,50.0~ server-side rendering
# ~./services.ts|1,27.3,-90.5,50.0~ import typescript directly
# ~./index.html|0,23.9,20.5,50.0~ zero-config bundling
```
Imba works just as well on the server as on the client. In fact, the *whole stack* of [scrimba.com](https://scrimba.com) is written in Imba. Forget config files and separate build steps – Imba bundles all your assets at blazing speeds – utilizing esbuild under the hood.

# Pane with divider [skip]
```imba
# [preview=inline]
import 'util/styles'
global css body > * pos:abs inset:6 rd:md of:hidden
# ---
import {genres} from 'imdb'

tag Panel
	prop split = 30

	<self[d:flex fs:xs bg:teal0]>
		<div[p:2 bg:teal1 flb:{split}%]> "Menu"
		<div[w:2 fls:0 bg:teal3 bg@touch:teal5]
			@touch.pin.fit(self,0,100)=(split=e.x)>
		<div[p:2 fl:1]>
			<ul> for genre in genres.top
				<li> genre.title

imba.mount <Panel>
# ~d:flex|1,28.0,-145.9,50.0~ Tailwind inspired inline styles
# ~@touch.pin|1,137.8,-235.9,50.0~ Rich touch handling
# ~.pin|0,21.0,-88.0,50.0~ Useful event modifiers
# ~@touch|0,10.3,111.7,50.0~ Style property variants
# ~%|1,41.5,-167.2,50.0~ Inline style interpolation
```

# Test

## Grids

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

## Event Modifiers

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

