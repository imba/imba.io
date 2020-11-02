# imba inspect

To inspect / debug imba code in node you need to run `node --inspect  $(which imba) my-imba-file.imba` instead of `imba my-imba-file.imba`.

You can use the same trick to pass any supported nodejs flags.

If you want to run the project via regular node directly you can also create a tiny js file like the following:

### Running via node [preview=md]
```imba app.imba
import './controls'
# my server code here
```
```javascript main.js
require('imba/register');
require('./app');
```