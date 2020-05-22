const data = {type: 'item', state: 'busy'}

# create dom element @log
<div> "Hello world"

# set attributes @log
<div title="welcome"> "Hello"

# dynamic attributes @log
<div title=data.type> "{data.type} is {data.state}"

# adding classes @log
<div.large.panel> "Hello"

# adding dynamic classes @log
<div.{data.type}>

# interpolated dynamic classes @log
<div.{data.type}.is-{data.state}>

# children are indented @log
<ul.list>
	<li> "one"
	<li> "two"
	<li> "three"