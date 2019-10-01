
import App from './app'
import Site from './views/Site'
import Guide from './data/guide'

# Setting up the express server
var express = require 'express'
var srv = express()

var highlighter = require './util/highlighter'

srv.disable('etag')
srv.use(express.static('./www'))

# srv.get '/' do |req,res| res.redirect('/home')
# srv.get '/install' do |req,res| res.redirect('/guide#toc-installation')

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

	var html = <html router-url=req:path>
		<head>
			<title> "imba.io"
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1,minimum-scale=1">
			<meta name="keywords" content="imba">
			<link href='http://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,600' rel='stylesheet' type='text/css'>
			<link rel="stylesheet" href="/dist/main.css" media="screen">
			<style html=highlighter:theme.CSS>		
			# <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png?v=2">
			# <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png?v=2">
			# <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png?v=2">
			# <link rel="manifest" href="/favicon/site.webmanifest?v=2">
			# <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg?v=2" color="#191a25">
			# <link rel="shortcut icon" href="/favicon/favicon.ico?v=2">
			# <meta name="msapplication-TileColor" content="#191a25">
			# <meta name="theme-color" content="#191a25">
		<body>
			<Site[req:app]>
			<script> "APPCACHE = $$APPCACHE$$"
			<script src="/dist/main.js">
	
	html.router.onReady do
		res.send html.toString.replace("$$APPCACHE$$",JSON.stringify(req:app.serialize))

var port = process:env.PORT or 3011

var server = srv.listen(port) do
	console.log 'server is running on port ' + port
