# reactive-scriptable-components (RSC) #

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
   </rsc-table>

   <script type="rsc-script">
    const observed = Object.assign(this.observed,{
      Celsius:0,
      Fahrenheit:0
    })

    reactively(() => observed.Fahrenheit = observed.Celsius * 9/5 + 32)
    reactively(() => observed.Celsius = 5/9 * (observed.Fahrenheit-32))
   </script>
  </rsc-applet>
```

The example basically consists of two number input controls, a bit of visual "decoration" and some "business logic".

What makes it interesting is how the logic works:

* `$value` attributes make the number input controls "reactive", i.e., user input changes the specified variable and variable changes will be reflected in the UI - and, yes, the circularity of the dependencies shown above causes no problem
* every "reactive scriptable component" (which is a standard [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)) may contain its own `observed` and `unobserved` (state) variables - in this trivial example, only the applet itself provides some "state", whereas the input controls do not
* whenever an `observed` variable is changed, all functions using that variable may be `reactively` recalculated - in this example, changes of the `Celsius` variable will recompute the `Fahrenheit` variable and vice-versa - and the `$value` reactivity will automatically update the number input fields.

This approach allows to write simple web applications within minutes - the author uses it for his computer science lectures at [Stuttgart University of Applied Sciences](https://www.hft-stuttgart.com/) in order to demonstrate various concepts and algorithms or give students the possibility to practice what they learned. You probably won't use "reactive-scriptable-components" to implement the next office package, but simple tools can be written with very little effort and in a way that may easily be understood even by inexperienced or casual programmers.

## Features ##

"reactive-scriptable-components" offer the following fundamental features:

- **Script Attributes**<br>(t.b.w)
- **Script Elements**<br>(t.b.w)
- **Delegated Scripts**<br>(t.b.w)
- **Behaviour Scripts**<br>(t.b.w)
- **Observed and Unobserved Variables**<br>(t.b.w)
- **Reactive Functions**<br>(t.b.w)
- **Reactive Attributes**<br>(t.b.w)
- **Event Handlers as Function Calls**<br>(t.b.w)
- **Error Indicators**<br>(t.b.w)

## Inlined Dependencies ##

"reactive-scriptable-components" are based on the following (brilliant!) libraries and packages:

* [HTM (Hyperscript Tagged Markup)](https://github.com/developit/htm) - for easy HTML markup using JavaScript template strings,
* [PREACT](https://github.com/preactjs/preact) - from which its efficient and light-weight DOM diffing is used, and
* [Hyperactiv](https://github.com/elbywan/hyperactiv) - a light-weight reactive library which even handles circular dependencies

All these dependencies have been bundled into the "reactive-scriptable-components" for faster loading and a predictable user experience.

> Nota bene: while it may be advisable to know how to use HTM, there is no immediate need to learn any of the above to write a RSC application.

The final distributables were built using the marvellous [microbundle](https://github.com/developit/microbundle).

## Usage ##

In order to avoid initial flashing of "custom Elements" (aka "Web Components") you should add the following lines at the beginning of the `<head/>` section in your HTML file:

```html
<style>
  :not(:defined) { visibility:hidden }
</style>
```

This trick applies to all kinds of Web Components, not just those presented here.

### Without any Build Environment ###

If you don't use any kind of build tool but create your web application directly in the browser or in an HTML file, just append the following line to the `<head/>` section (after all RSC behaviour scripts, if you need any):

```html
<script type="module" src="https://rozek.github.io/reactive-scriptable-components/dist/reactive-scriptable-components.modern.js"></script>
```

That's all...

### With a Build Environment ###

(t.b.w)

## API Reference ##

(t.b.w)

## Examples ##

(t.b.w)

## Behaviours ##

(t.b.w)

## Script Templates ##

The following code templates may be quite practical when writing custom behaviours - you don't _have_ to use them, but they may save you some typing.

### Initialization ###

Explicitly setting the initial state (and using accessors for any further state changes, as shown below) makes code that uses this state leaner. You may use

```javascript
  this.unobserved.XXX = ...
```

if you have a single state variable only, or

```javascript
  Object.assign(this.unobserved,{
    XXX:...,
    YYY:...,
  })
```

if you have more of them.

### State Access ###

It is always a good idea to protect a visual's state against faulty values. You may use the following template to define your own custom accessors:

```javascript
  const my = this       // "my" is relevant in the following getters and setters
  Object.assign(my.observed,{
    get XXX () { return my.unobserved.XXX },
    set XXX (newValue) {
      ... // add your validation logic here
      my.unobserved.XXX = newValue
    },
    ... // add as many accessors as you need
  })
```

### Attribute Mapping ###

Internally, RSC works with arbitrary JavaScript values as their state, but initially, you may want to configure your visuals using element attributes (which are always strings). You may use the following code to map attributes to state variables

```javascript
  onAttributeChange((Name, newValue) => {
    if (Name === 'xxx') {
      this.observed.XXX = newValue
    }
  })
```

if you only need to map a single attribute, or

```javascript
  onAttributeChange((Name, newValue) => {
    switch (Name) {
      case 'xxx': this.observed.XXX = newValue; break
      case 'yyy': this.observed.YYY = newValue; break
    }
  })
```

if you have more of them.

Please, keep in mind, that you may have to _parse_ given attributes before they can be assigned to state variables. Typical "parsers" include:

```javascript
  parseNumber(newValue)
  parseInt(newValue,10)
  JSON.parse(newValue)
```

Don't forget, that parsing may fail - you may want to handle parser errors explicitly, but RSC will catch exceptions in `onAttributeChange` and present an error indicator for any unhandled error.

### Custom Rendering ###

In almost any case, you may want to render your new visual in a custom way: use

```javascript
  toRender(() => html`...`)
```

for simple one-liners without additional rendering logic, or

```javascript
  toRender(() => {
    ... // add your logic here
    return html`...`
  })
```

for anything else

## License ##

[MIT License](LICENSE.md)
