
import App from './app'
import Site from './views/Site'
import Guide from './data/guide'
import LanguageCode from './util/languages'

var highlighter = require './util/highlighter'

const path = require 'path'
const fs = require 'fs'

# creating the local app
APP = App.new

const lang = LanguageCode('en')
let guide = Guide.get 'en'
let app = App.new(guide: guide.docs)

var html = <html router-url='/'>
	<head>
		<title> "imba.io"
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1,minimum-scale=1">
		<meta name="keywords" content="imba">
		<link href='https://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,600' rel='stylesheet' type='text/css'>
		<link rel="stylesheet" href="/dist/main.css" media="screen">
		<style html=highlighter:theme.CSS>
	<body>
		<Site[app]>
		<script> "APPCACHE = $$APPCACHE$$"
		<script src="/dist/main.js">
	
const output = html.toString.replace("$$APPCACHE$$",JSON.stringify(app.serialize))
const indexFile = path.join(path.resolve(__dirname), '../www/index.html')
fs.writeFileSync(indexFile, output)
