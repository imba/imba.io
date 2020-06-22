import {%btn,%box} from './shared.imba'

tag Item
	css %btn bg.primary:teal4 d:grid jc:start

	<self>
		<div%btn.primary> "Item Button"

tag Group
	css %btn bg.primary:purple5

	<self>
		<div%btn.primary> "Group Button"
		<Item%box>

tag App
	<self>
		<div%btn.primary> "App Button"
		<Group%box>

imba.mount <App%box>