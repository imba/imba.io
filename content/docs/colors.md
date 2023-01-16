# Colors

[demo](/examples/css/colors.imba?preview=styles)

The color CSS data-type represents a color in the sRGB color space. Colors can be defined in all the same ways as in plain css. In addition, imba as built-in support for named colors hand-crafted by the great people behind [Tailwind](https://tailwindcss.com). All named colors come in 10 different shades, named from `color0` up to `color9`. You can hover over each color below to see their name:

<doc-colors></doc-colors>

Just like other colors like `#7A4ACF`, `hsl(120,90%,45%)`, `rgba(120,255,176)`, these named colors can be used anywhere in your styles where a color value is expected.

## Color Theming

Imba already contains color keywords, but you may also create aliases for color keywords, make your own keywords, or redefine the default keywords to new color values.

### Create config file

Create an `imbaconfig.json` at the root of your imba project. Right next to your package.json and readme.md files. 

```json
{
	"theme": {
		"colors": {			
		}
	}
}
```

> Any changes made to the imbaconfig.json file will require you to restart your localhost server to take effect.

### Aliasing colors

We can create an alias for the `indigo` color called `primary` in this way.

```json
{
	"theme": {
		"colors": {			
			"primary": "indigo"
		}
	}
}
```

Now we can use `primary` instead of `indigo` to set the indigo color.

```imba
<h1[c:primary4]> "hello world!"
```

We can also override default color keywords. We can make `gray` an alias for `warmer` instead of the default gray colors.

```json
{
	"theme": {
		"colors": {			
			"gray": "warmer"
		}
	}
}
```

### Defining custom colors

We can create our own color keywords with specified tint values.

```json
{
    "theme": {
        "colors": {
            "coral": {
                "0": "hsl(40,33%,98%)",
                "1": "hsl(28,61%,94%)",
                "2": "hsl(12,62%,88%)",
                "3": "hsl(10,54%,76%)",
                "4": "hsl(6,56%,65%)",
                "5": "hsl(5,49%,54%)",
                "6": "hsl(4,49%,44%)",
                "7": "hsl(4,50%,34%)",
                "8": "hsl(4,50%,24%)",
                "9": "hsl(6,52%,15%)"
            }
        }
    }
}
```

We will then be able to use our own color keyword as we would use the default color keywords.

```imba
<h1[c:coral7/70]> "hello world!"
```

Any unspecified tint will be interpolated automatically. So the configuration below will produce a similar result.

```json
{
    "theme": {
        "colors": {
            "coral": {
                "0": "hsl(40,33%,98%)",
                "4": "hsl(6,56%,65%)",
                "9": "hsl(6,52%,15%)"
            }
        }
    }
}
```
