import express from 'express'
import passport from 'passport'
import services from './services.ts'
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
# ~import express|2,13,19,65,17,86,61~ import any javascript library
# ~import se|2,-3,75,54,20,84,56~ ... typescript files
# ~import in|2,-5,111,50,15,92,43~ ... html, css, images & more
# ~body|0,60,-33,92,12,9,51~ server-side rendering
# ~./services.ts|1,85,-32,50,-13,2,52~ import typescript directly