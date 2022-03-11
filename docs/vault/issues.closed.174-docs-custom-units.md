---
id: 6kfgih3wsv4epgvw03adkxf
title: 174 Docs Custom Units
desc: ''
updated: 1646819388335
created: 1646819388335
url: 'https://github.com/imba/imba.io/issues/174'
status: CLOSED
issueID: MDU6SXNzdWU3NjcwMjA4MDk=
author: 'https://github.com/Pistus'
---
Made another educated guess start of documenting custom units. Would be great to know if this is anywhere close @somebee 🔍 The example can be made simpler, but not sure what the best selling points of custom units are yet.

## Custom Units
You can define your own custom numerical unit that can be used for styling and calculations. You define a custom unit by using a css property starting with a number (measure) and then the unit name. For example 1t: <expression>. The unit can have modifiers like break points and you can use the units in the same way as native numerical units like px and em.

Here is an example defining `t` and `w` as units:

```imba custom-unit.imba
tag base-dialog
    css
        1t:5vmin @md:200px @lg:10% # define t to different variable sizes depending on the width of the screen
        1w:340px # define the w unit as a fixed size
        max-width:2w # basic use of custom unit
        max-height: calc(100vh - 1t) # calculate with custom unit
        position:absolute top:1t left:calc(50% - 0.5w) # Using fraction of units

tag larger-dialog < base-dialog
    css
        1t:10vmin @md:400px @lg:20% # re-defining the `t` unit - all inherited styles will use the new value
        1w:400px
        # will inherit max-width, max-height, top and left properties with overwritten w and t values. 
        # max-width: 2w => 2 * 400px => 800px
        # max-height: calc(100vh - (10vmin @md:400px @lg:20%))
        # position:absolute top:(10vmin @md:400px @lg:20%) left:calc(50% - 0.5 * 400px) # Using fraction of units
