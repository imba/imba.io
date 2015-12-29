require 'imba'
Imbac = require 'imba/compiler'



DEBUG = 0
Imba.SERVER = 1
ENV_CLIENT = 0

require '../src/views'
import App from '../src/app'

var fs = require 'fs'
var hl = require 'scrimbla/src/core/highlighter'

# creating the local app
APP = App.new
APP.Highlighter = hl.Highlighter
APP.Markdown = require('../src/markdown')

# connection to github
var github = require 'octonode'
var ghclient = github.client(process:env.GHTOKEN)
var ghrepo = ghclient.repo('somebee/imba.io')

var cache = {}

def format doc
	var json = JSON.stringify(doc) do |key,value|
		if key isa String and key.match(/(^|\_)url$/)
			return undefined
		return value
	JSON.parse(json)

def issues opts = {}, &cb
	if cache:issues
		return cb(cache:issues)
	# issues should be synced and cached by the server instead
	ghrepo.issues(opts) do |err, body|
		console.log(arguments)
		body = format(body)
		cb(cache:issues = body)

def issue nr, &cb
	if cache[nr]
		return cb(cache[nr])

	ghclient.issue('somebee/imba.io', nr).info do |err,info|
		info = format(info)
		info:md = APP.Markdown.render(info:body)[:body]
		cb(cache[nr] = info)


def fetch-issue nr
	issue(nr) do |issue|
		fs.writeFileSync("{__dirname}/../docs/issues/{nr}.json",JSON.stringify(issue))

def fetch-issues deep = no
	issues(labels: ['article']) do |items|
		if deep
			fetch-issue(item:number) for item in items
		fs.writeFileSync("{__dirname}/../docs/issues/all.json",JSON.stringify(items))


fetch-issues(yes)