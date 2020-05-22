const data = {type: 'item', state: 'busy'}

# create dom element @log
<div> "Hello world"

# set attributes @log
<div title="welcome"> "Hello"

# adding classes @log
<div.large.panel> "Hello"

# adding dynamic classes @log
<div.{data.type}>

# interpolated dynamic classes @log
<div.{data.type}.is-{data.state}>