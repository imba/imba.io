# try ... catch

## Examples

### single-line try [preview=md]
```imba app.imba
def run
    # adding a try without a catch block will silently swallow an error
    let test = try Math.rendom!
    return test
```