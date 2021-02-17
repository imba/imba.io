import 'imba/preflight.css'
import store from './store'

global css body
	m:0 p:0 ff:sans bg:#f6f6ef
	a c:inherit td:none @hover:underline cursor:pointer

tag story-item < li
	<self[d:block py:2 px:4] @intersect.silent.in=data.load!>
		<div>
			<span[fs:sm/1.2 c:gray9]> data.title or "-"
			<span[ml:1 prefix:"(" suffix:")" d@empty:none]>
				if data.url then <a href=data.url.href> data.url.hostname
		<div> "{data.score} points by {data.by}"

tag story-list
	def mount
		data = await store.fetch(api-url)
		data.preload(0,15)

	<self> <ul> for item in data
		<story-item data=item>

tag app-root
	<self>
		<header[bg:#ff6602 h:8 d:hflex ja:center]>
			css a px:1 c.active:white
			<a route-to='/top'> "Top"
			<a route-to='/newest'> "New"
			<a route-to='/show'> "Show"
			<a route-to='/ask'> "Ask"
			<a route-to='/jobs'> "Jobs"
		<main[c:gray5 fs:xs]>
			<story-list route='/top' api-url='topstories'>
			<story-list route='/newest' api-url='newstories'>
			<story-list route='/show' api-url='showstories'>
			<story-list route='/ask' api-url='askstories'>
			<story-list route='/jobs' api-url='jobstories'>

imba.router.alias('/', '/top')
imba.mount <app-root>