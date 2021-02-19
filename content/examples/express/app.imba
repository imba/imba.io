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
# ~import express|18,-5.8,0.8,65,17,83,40,0,1.3/18,7.2,0.3,14,17,20,36,29.8,1.8~ import any javascript library
# ~import in|18,-9.6,1.3,24,21,87,46,0.5,0.8/18,8.4,0.8,24,21,7,49,32.3,0.6~ ... and typescript, html, css, images++
# ~body|16,3.4,-1.3,24,12,46,82,1.5,0/16,-0.6,-1.3,24,12,46,82,1.5,0~ server-side rendering
# ~./confused-cat.png|16,4.3,-1.7,22,14,9,49,14,0.5/16,4.8,1.1,22,18,2,35,16,2.8~ images are resolved and bundled
# ~imba.serve|18,-7.2,-1.5,26,19,86,63,0,1.5/18,7.5,-0.8,9,38,2,51,6.3,0~ serve with live reloading, asset bundling++