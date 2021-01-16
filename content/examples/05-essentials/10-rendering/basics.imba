const data = {type: 'item', state: 'busy'}

# @log create dom element
<div> "Hello world"

# @log set attributes
<div title="welcome"> "Hello"

# @log dynamic attributes
<div title=data.type> "{data.type} is {data.state}"

# @log adding classes
<div.large.panel> "Hello"

# @log adding dynamic classes
<div.{data.type}>

# @log interpolated dynamic classes
<div.{data.type}.is-{data.state}>

# @log indenting children
<ul.list>
	<li> "one"
	<li> "two"
	<li> "three"