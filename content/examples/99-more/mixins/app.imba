import {%btn} from './styles'

tag list-item
	css %btn bg:teal4 @hover:teal5
	<self> <div%btn> "Item Button"

tag app-list
	css %btn py:3 fs:lg

	<self>
		<div%btn> "App Button"
		<section>
			<label> 'items'
			<list-item>
			<list-item>
			<list-item>

imba.mount <app-list>