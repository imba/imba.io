import express from 'express'
import passport from 'passport'
import index from './index.html'
import image from './confused-cat.png'

const app = express()

app.get '/404' do(req,res)
	res.send String <html> <body>
		<h1> "We could not find this page!"
		<img src=image>
		<a href='/'> "Go home!"

app.get '/:page' do(req,res)
	res.send index.body

app.get '/' do(req,res)
	res.redirect('/top')

imba.serve app.listen(8001)
# ~import express|2,-5,18,65,17,83,40~ import any javascript library
# ~import in|2,-3,124,80,15,92,43~ ... and typescript, html, css, images++
# ~body|0,-10,-32,24,12,46,82~ server-side rendering
# ~./confused-cat.png|0,34,-38,22,14,9,49~ images are resolved and bundled
# ~imba.serve|2,-11,388,26,19,86,63~ serve with live reloading, asset bundling++