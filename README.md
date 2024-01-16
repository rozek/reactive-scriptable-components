# reactive-scriptable-components #

light-weight reactive scriptable web components

The idea behind this framework is to allow for the rapid development of small reactive web applications. To give you an idea of what these web apps could look like, consider the following example (which implements a simple calculator that converts temperatures between °Celsius and °Fahrenheit):

```html
  <rsc-applet>
   <rsc-title>Temperature Converter</rsc-title>
   <rsc-table columns="2">
    <rsc-label>Celsius:</rsc-label>
    <rsc-number-input $value="Applet.observed.Celsius"></rsc-number-input>

    <rsc-label>Celsius:</rsc-label>
    <rsc-number-input $value="Applet.observed.Fahrenheit"></rsc-number-input>
   </>

   <script type="rsc-script">
    const observed = Object.assign(this.observed,{
      Celsius:0,
      Fahrenheit:0
    })

    reactively(() => observed.Fahrenheit = observed.Celsius * 9/5 + 32)
    reactively(() => observed.Celisus = 5/9 * (observed.Fahrenheit-32))
   </script>
  </rsc-applet>
```

The example basically consists of two number input controls, a bit of visual "decoration" and some "business logic".

What makes it interesting is how the logic works:

* `$value` attributes make the number input controls "reactive", i.e., user input changes the specified variable and variable changes will be reflected in the UI - and, yes, the circularity of the dependencies shown above causes no problem
* every "reactive scriptable component" (which is a standard [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)) may contain its own `observed` and `unobserved` (state) variables - in this trivial example, only the applet itself provides some "state", whereas the input controls do not
* whenever an `observed` variable is changed, all functions using that variable may be `reactively` recalculated - in this example, changes of the `Celsius` variable will recompute the `Fahrenheit` variable and vice-versa - and the `$value` reactivity will automatically update the number input fields.

This approach allows to write simple web applications within minutes - the author uses it for his computer science lectures at [Stuttgart University of Applied Sciences](https://www.hft-stuttgart.com/) in order to demonstrate various concepts and algorithms or give students the possibility to explore and practice. You probably won't use "reactive-scriptable-components" to implement the next office package, but simple tools can be written with very little effort and in a way that may easily be understood even by inexperienced or casual programmers.

## Features ##

(t.b.w)

## Dependencies ##

"reactive-scriptable-components" is based on the following libraries and packages:

* [HTM (Hyperscript Tagged Markup)](https://github.com/developit/htm) - for easy HTML markup using JavaScript template strings,
* [PREACT](https://github.com/preactjs/preact) - for efficient and light-weight DOM diffing and
* [Hyperactiv](https://github.com/elbywan/hyperactiv) - a light-weight reactive library which evene handles circular dependencies

All of the above tools are brilliant by themselves - but, when combined, they even make frameworks like "reactive-scriptable-components" possible.

## Usage ##

(t.b.w)

## API Reference ##

(t.b.w)

## Examples ##

(t.b.w)

## Behaviours ##

(t.b.w)

## License ##

[MIT License](LICENSE.md)
