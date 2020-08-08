# import

Imba 

## Syntax
```imba
import defaultExport from "module-name"
import * as name from "module-name"
import { export1 } from "module-name"
import { export1 as alias1 } from "module-name"
import { export1 , export2 } from "module-name"
import { foo , bar } from "module-name/path/to/specific/un-exported/file"
import { export1 , export2 as alias2 , [...] } from "module-name"
import defaultExport, { export1 [ , [...] ] } from "module-name"
import defaultExport, * as name from "module-name"
import "module-name"
```

## Examples

### importing web components
```imba
import './my-component'
```

### import default
```imba
import DefaultExport from './source'
```

### import members
```imba
import {capitalize,camelize} from './util'
```

### import members with alias
```imba
import {capitalize as toUpperCase,camelize} from './util'
```

### Import an entire module's contents
```imba
import * as myModule from 'my-module'
```

### Import a single export from a module [preview=md]
```imba
~~~app.imba
# ~preview
import {myExport} from './util'
console.log myExport!
~~~util.imba
export def myExport
    return 123
```


### Import web component [preview=md]
```imba
~~~app.imba
# ~preview
import './component'

imba.mount do <div[pos:absolute inset:0 d:flex a:center j:center]>
    <my-component>
    <my-component>
~~~component.imba
export tag my-component
    <self[d:inline-block p:2]> "Custom component"
```