
import App from './app'
import Site from './views/Site'
import Guide from './data/guide'

# Setting up the express server
var express = require 'express'
var srv = express()

var highlighter = require './util/highlighter'

srv.disable('etag')
srv.use(express.static('./www'))

srv.get '/' do |req,res| res.redirect('/home')
srv.get '/install' do |req,res| res.redirect('/guide#toc-installation')

# creating the local app
APP = App.new

# rendering markdown
srv.get(/^([^\.]+\.(md|json|imba))$/) do |req,res|
	var result = await APP.fetch(req:path)
	res.send JSON.stringify(result)

# catch-all rendering for the whole site
# routing etc is handled by the <site> tag itself
srv.get(/^([^\.]*)$/) do |req,res|
	let guide = Guide.get
	let app = req:app = App.new(guide: guide.docs)
	req:app.req = req

	var site = <Site data=req:app>
	
	await site.load

	var html = <html>
		<head>
			<title> "imba.io"
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1,minimum-scale=1">
			<meta name="keywords" content="imba">
			<link href='http://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,600' rel='stylesheet' type='text/css'>
			<link rel="stylesheet" href="/dist/main.css" media="screen">
			<style> highlighter:theme.CSS
		<body>
			site
			<script> "APPCACHE = $$APPCACHE$$"
			<script src="/dist/main.js">
		
	return res.send html.toString.replace("$$APPCACHE$$",JSON.stringify(req:app.serialize))

var port = process:env.PORT or 3011

var server = srv.listen(port) do
	console.log 'server is running on port ' + port
