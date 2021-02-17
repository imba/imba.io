import express from 'express'
import passport from 'passport'
import index from './index.html'

const app = express()

app.get '/404' do(req,res)
	res.send String <html> <body>
		<h1> "We could not find this page!"
		<img src='./confused-cat.png'>
		<a href='/'> "Go home!"

app.get '/' do(req,res)
	res.send index.body

imba.serve app.listen(8001)
# ~import express|2,13,19,65,17,83,40~ import any javascript library
# ~import in|2,-3,124,80,15,92,43~ ... and typescript, html, css, images++
# ~body|0,25,-52,39,12,9,51~ server-side rendering
# ~./confused-cat.png|0,100,27,41,14,9,49~ images are resolved and bundled
# ~imba.serve|2,7,308,26,19,86,63~ serve with live reloading, asset bundling++