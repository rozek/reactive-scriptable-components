import { registerBehaviour } from 'RSC'

  registerBehaviour('centered',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                               rsc-centered                               --
//------------------------------------------------------------------------------

  toRender(() => html`
    <style>
      :host {
        display:inline-block; position:relative;
      }
    </style>
    <div style="
      display:block; position:absolute;
      left:50%; top:50%; transform:translate(-50%,-50%);
    ">
      <slot/>
    </div>
  `)


    },[]
  )


  registerBehaviour('horizontal',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                              rsc-horizontal                              --
//------------------------------------------------------------------------------

  my.unobserved.Alignment = 'start'

  RSC.assign(my.observed,{
    get Alignment () { return my.unobserved.Alignment },
    set Alignment (newValue) {
      JIL.expectOneOf('alignment setting',newValue,[
        'left','center','right', 'start','end'
      ])
      my.unobserved.Alignment = newValue
    }
  })

  onAttributeChange((Name, newValue) => {
    if (Name === 'align') {
      my.observed.Alignment = newValue
      return true
    }
  })

  toRender(() => {
    const Alignment = my.observed.Alignment

    return html`
      <style>
        :host {
          display:inline-block; position:relative;
        }
      </style>
      <div style="
        display:flex; position:absolute; flex-flow:row nowrap;
        justify-content:${Alignment}; align-items:stretch;
        left:0px; top:0px; width:100%; height:100%;
      ">
        <slot/>
      </div>
    `
  })


    },['align']
  )


  registerBehaviour('vertical',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                               rsc-vertical                               --
//------------------------------------------------------------------------------

  my.unobserved.Alignment = 'start'

  RSC.assign(my.observed,{
    get Alignment () { return my.unobserved.Alignment },
    set Alignment (newValue) {
      JIL.expectOneOf('alignment setting',newValue,[
        'top','center','bottom', 'start','end'
      ])
      my.unobserved.Alignment = newValue
    }
  })

  onAttributeChange((Name, newValue) => {
    if (Name === 'align') {
      my.observed.Alignment = newValue
      return true
    }
  })

  toRender(() => {
    let Alignment = my.observed.Alignment
    switch (Alignment) {
      case 'top':    Alignment = 'start'; break // TODO: not always correct
      case 'bottom': Alignment = 'end';   break // TODO: not always correct
    }

    return html`
      <style>
        :host {
          display:inline-block; position:relative;
        }
      </style>
      <div style="
        display:flex; position:absolute; flex-flow:column nowrap;
        justify-content:${Alignment}; align-items:stretch;
        left:0px; top:0px; width:100%; height:100%;
      ">
        <slot/>
      </div>
    `
  })


    },['align']
  )


  registerBehaviour('tabular',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                               rsc-tabular                                --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Columns:2,
    ColumnStyles:[],
    verticalAlignment:'top',
  })

  RSC.assign(my.observed,{
    get Columns () { return my.unobserved.Columns },
    set Columns (newValue) {
      JIL.expectCardinal('column count',newValue)
      my.unobserved.Columns = newValue
    },

    get ColumnStyles () { return my.unobserved.ColumnStyles },
    set ColumnStyles (newValue) {
      JIL.allowListSatisfying('column style list',newValue,JIL.ValueIsString)
      my.unobserved.ColumnStyles = newValue || []
    },

    get verticalAlignment () { return my.unobserved.verticalAlignment },
    set verticalAlignment (newValue) {
      JIL.expectOneOf('vertical row alignment setting',newValue,[
        'top','middle','bottom','baseline'
      ])
      my.unobserved.verticalAlignment = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    switch (Name) {
      case 'columns':       my.observed.Columns = parseInt(newValue,10);     break
      case 'column-styles': my.observed.ColumnStyles = JSON.parse(newValue); break
      case 'valign':        my.observed.verticalAlignment = newValue;        break
      default: return false
    }
    return true
  })

  toRender(() => {
    const {
      Columns:ColumnLimit, ColumnStyles, verticalAlignment
    } = my.observed

    const innerElements = Array.from(my.children)

    const Rows = []; let SlotCount = 0, ColumnCount
    if (innerElements.length > 0) {
      Rows.push([]); ColumnCount = 0                            // start new row

      while (innerElements.length > 0) {
        const nextElement = innerElements.shift()
          SlotCount += 1
        nextElement.setAttribute('slot',''+SlotCount) // TODO: very, very poor

        if (nextElement.tagName === 'RSC-COLSPAN') {
          let Width = parseInt(nextElement.getAttribute('columns') || '',10)
          if (isNaN(Width)) { Width = 1 } else { Width = Math.max(1,Width) }

          Rows[Rows.length-1].push(
            html`<td colspan="${Width}"><slot name="${SlotCount}"/></td>`
          )
          ColumnCount += Width
        } else {
          Rows[Rows.length-1].push(
            html`<td><slot name="${SlotCount}"/></td>`
          )
          ColumnCount += 1
        }

        if ((ColumnCount >= ColumnLimit) && (innerElements.length > 0)) {
          Rows.push([]); ColumnCount = 0                        // start new row
        }
      }
    }

    return html`
      <style>
        :host {
          display:inline-block; position:relative;
        }
      </style>
      <table>
        ${ColumnStyles.length > 0 ? html`
          <colgroup>${ColumnStyles.map((Style) => {
            return html`<col style="${Style}"/>`
          })}</colgroup>
        ` : ''}
        <tbody>
          ${Rows.map((Row) => {
            return html`<tr valign="${verticalAlignment}">${Row}</tr>`
          })}
        </tbody>
      </table>
    `
  })


    },['columns','column-styles','valign']
  )


  registerBehaviour('cColSpan',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                               rsc-colspan                                --
//------------------------------------------------------------------------------

  toRender(() => html`<slot/>`)


    },[]
  )


  registerBehaviour('Gap',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                                 rsc-gap                                  --
//------------------------------------------------------------------------------

  my.unobserved.Width  = 1
  my.unobserved.Height = 1

  RSC.assign(my.observed,{
    get Width () { return my.unobserved.Width },
    set Width (newValue) {
      JIL.expectOrdinal('gap width',newValue)
      my.unobserved.Width = newValue
    },

    get Height () { return my.unobserved.Height },
    set Height (newValue) {
      JIL.expectOrdinal('gap height',newValue)
      my.unobserved.Height = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    switch (Name) {
      case 'width':  my.observed.Width  = parseInt(newValue,10); break
      case 'height': my.observed.Height = parseInt(newValue,10); break
      default: return false
    }
    return true
  })

  toRender(() => html`
    <div style="width:${my.observed.Width}px; height:${my.observed.Height}px"/>
  `)


    },['width','height']
  )


  registerBehaviour('HTMLView',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                               rsc-htmlview                               --
//------------------------------------------------------------------------------

  my.unobserved.Value = ''

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowText('HTML value',newValue)
      my.unobserved.Value = newValue || ''
    }
  })

  toRender(() => html`
    <style>
      :host {
        display:inline-block; position:relative;
      }
    </style>
    <div style="display:block; position:relative; width:100%; height:100%"
      dangerouslySetInnerHTML=${{__html:my.observed.Value}}
    />
  `)


    },['Value']
  )


  registerBehaviour('TextView',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                               rsc-textview                               --
//------------------------------------------------------------------------------

  my.unobserved.Value = ''

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowText('text value',newValue)
      my.unobserved.Value = newValue || ''
    }
  })

  toRender(() => html`
    <style>
      :host {
        display:inline-block; position:relative;
      }
    </style>
    ${my.observed.Value}
  `)


    },['Value']
  )


  registerBehaviour('ImageView',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                              rsc-imageview                               --
//------------------------------------------------------------------------------

  const RSC_ImageScalings   = ['none','stretch','cover','contain']
  const RSC_ImageAlignments = [
    'left top','center top','right top','left center','center center',
    'right center','left bottom','center bottom','right bottom'
  ]

  RSC.assign(my.unobserved,{
    Value:         '',
    ImageScaling:  'contain',
    ImageAlignment:'center center',
  })

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowURL('image URL value',newValue)
      my.unobserved.Value = newValue || ''
    },

    get ImageScaling () { return my.unobserved.ImageScaling },
    set ImageScaling (newValue) {
      JIL.allowOneOf('image scaling',newValue,RSC_ImageScalings)
      my.unobserved.ImageScaling = newValue || 'contain'
    },

    get ImageAlignment () { return my.unobserved.ImageAlignment },
    set ImageAlignment (newValue) {
      JIL.allowOneOf('image alignment',newValue,RSC_ImageAlignments)
      my.unobserved.ImageAlignment = newValue || 'contain'
    },
  })

  toRender(() => {
    const { Value,ImageScaling,ImageAlignment } = my.observed

    return html`
      <style>
        :host { display:inline-block; font-size:0px; line-height:0px }
      </style>
      <img src=${Value} style="
        object-fit:${ImageScaling === 'stretch' ? 'fill ' : ImageScaling};
        object-position:${ImageAlignment};
      "/>
    `
  })


    },['Value','ImageScaling','ImageAlignment']
  )


  registerBehaviour('native-Button',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                            rsc-native-button                             --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:'',
    enabled:true,
  })

  RSC.assign(my.observed,{
    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    if (Name === 'enabled') {
      my.observed.enabled = (newValue === 'enabled') || (newValue === '')
      return true
    }
    return false // triggers automatic mapping
  })

  toRender(() => {
    return html`
      <style>
        :host { display:inline-block }
      </style>
      <button disabled=${! my.observed.enabled}>
        ${my.observed.Value}
        <slot/>
      </button>
    `
  })


    },['Value','enabled']
  )


  registerBehaviour('native-Checkbox',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                           rsc-native-checkbox                            --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:null,    // false, true or null/undefined
    enabled:true,
  })

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowBoolean('checkbox value',newValue)
      my.unobserved.Value = newValue
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    if (Name === 'value') {
      switch (newValue) {
        case 'true':  my.observed.Value = true;      break
        case 'false': my.observed.Value = false;     break
        default:      my.observed.Value = undefined; break
      }
      return true
    }

    if (Name === 'enabled') {
      my.observed.enabled = (newValue === 'enabled') || (newValue === '')
      return true
    }
    return false // triggers automatic mapping
  })

  toRender(() => {
    const isChecked       = (my.observed.Value == true)
    const isIndeterminate = (my.observed.Value == null)

    function onInput (Event) {
      my.observed.Value = Event.target.checked
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="checkbox" disabled=${! my.observed.enabled}
        checked=${isChecked} indeterminate=${isIndeterminate}
        onInput=${onInput}
      />
    `
  })


    },['Value','enabled']
  )


  registerBehaviour('native-Radiobutton',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                          rsc-native-radiobutton                          --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:undefined, // may be of any type
    Match:undefined, // dto.
    enabled:true,
  })

  RSC.assign(my.observed,{
    get Value ()         { return my.unobserved.Value },
    set Value (newValue) { my.unobserved.Value = newValue },

    get Match ()         { return my.unobserved.Match },
    set Match (newValue) { my.unobserved.Match = newValue },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    if (Name === 'enabled') {
      my.observed.enabled = (newValue === 'enabled') || (newValue === '')
      return true
    }
    return false // triggers automatic mapping
  })

  toRender(() => {
    function onInput (Event) {
      if (Event.target.checked) {
        my.observed.Value = my.observed.Match
      }
    }

    const isChecked = (my.observed.Value === my.observed.Match)

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="radio" disabled=${! my.observed.enabled}
        checked=${isChecked}
        onInput=${onInput}
      />
    `
  })


    },['Value','Match','enabled']
  )



  registerBehaviour('native-Gauge',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                             rsc-native-gauge                             --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{ // all values are numbers or undefined
    Value:undefined,
    Minimum:undefined, lowerBound:undefined,
    Optimum:undefined,
    Maximum:undefined, upperBound:undefined,
  }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowNumber('gauge value',newValue)
      my.unobserved.Value = newValue
    },

    get Minimum () { return my.unobserved.Minimum },
    set Minimum (newValue) {
      JIL.allowNumber('minimal value',newValue)
      my.unobserved.Minimum = newValue
    },

    get lowerBound () { return my.unobserved.lowerBound },
    set lowerBound (newValue) {
      JIL.allowNumber('lower bound',newValue)
      my.unobserved.lowerBound = newValue
    },

    get Optimum () { return my.unobserved.Optimum },
    set Optimum (newValue) {
      JIL.allowNumber('optimal value',newValue)
      my.unobserved.Optimum = newValue
    },

    get upperBound () { return my.unobserved.upperBound },
    set upperBound (newValue) {
      JIL.allowNumber('upper bound',newValue)
      my.unobserved.upperBound = newValue
    },

    get Maximum () { return my.unobserved.Maximum },
    set Maximum (newValue) {
      JIL.allowNumber('maximal value',newValue)
      my.unobserved.Maximum = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'value':       my.observed.Value      = parsed(newValue); break
      case 'minimum':     my.observed.Minimum    = parsed(newValue); break
      case 'lower-bound': my.observed.lowerBound = parsed(newValue); break
      case 'optimum':     my.observed.Optimum    = parsed(newValue); break
      case 'upper-bound': my.observed.upperBound = parsed(newValue); break
      case 'maximum':     my.observed.Maximum    = parsed(newValue); break
      default: return false // triggers automatic mapping
    }
    return true
  })

  toRender(() => {
    const { Value, Minimum,lowerBound,Optimum,upperBound,Maximum } = my.observed

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <meter value=${isNaN(Value) ? '' : Value}
        min=${Minimum} low=${lowerBound} opt=${Optimum}
        high=${upperBound} max=${Maximum}
      />
    `
  })


    },['Value','Minimum','lowerBound','Optimum','upperBound','Maximum']
  )


  registerBehaviour('native-Progressbar',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                          rsc-native-progressbar                          --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{ // all values are numbers or undefined
    Value:undefined,
    Maximum:undefined,
  })

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowNumber('progressbar value',newValue)
      my.unobserved.Value = newValue
    },

    get Maximum () { return my.unobserved.Maximum },
    set Maximum (newValue) {
      JIL.allowNumber('progressbar maximum',newValue)
      my.unobserved.Maximum = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'value':   my.observed.Value   = parsed(newValue); break
      case 'maximum': my.observed.Maximum = parsed(newValue); break
      default: return false // triggers automatic mapping
    }
    return true
  })

  toRender(() => {
    const { Value,Maximum } = my.observed

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <progress value=${isNaN(Value) ? '' : Value} max=${Maximum} />
    `
  })


    },['Value','Maximum']
  )


  registerBehaviour('native-Slider',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                            rsc-native-slider                             --
//------------------------------------------------------------------------------

  const    HashmarkPattern = /^\s*(\d+(?:[.]\d+)?|\d*[.](?:\d*))(?:\s*:\s*([^\x00-\x1F\x7F-\x9F\u2028\u2029\uFFF9-\uFFFB]+))?$/
  function HashmarkMatcher (Value) {
    return HashmarkPattern.test(Value)
  }

  RSC.assign(my.unobserved,{
    Value:undefined,
    Minimum:undefined, Maximum:undefined,
    Stepping:'any', Hashmarks:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowNumber('slider value',newValue)
      my.unobserved.Value = newValue
    },

    get Minimum () { return my.unobserved.Minimum },
    set Minimum (newValue) {
      JIL.allowNumber('minimal input value',newValue)
      my.unobserved.Minimum = newValue
    },

    get Maximum () { return my.unobserved.Maximum },
    set Maximum (newValue) {
      JIL.allowNumber('maximal input value',newValue)
      my.unobserved.Maximum = newValue
    },

    get Stepping () { return my.unobserved.Stepping },
    set Stepping (newValue) {
      if (newValue !== 'any') {
        JIL.allowNumber('step value',newValue)
      }
      my.unobserved.Stepping = newValue
    },

    get Hashmarks () { return my.unobserved.Hashmarks.slice() },
    set Hashmarks (newValue) {
      JIL.allowListSatisfying('list of hashmarks',newValue, HashmarkMatcher)
      my.unobserved.Hashmarks = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'value':   my.observed.Value   = parsed(newValue); break
      case 'minimum': my.observed.Minimum = parsed(newValue); break
      case 'maximum': my.observed.Maximum = parsed(newValue); break
      case 'stepping':
        my.observed.Stepping = (newValue === 'any' ? 'any' : parsed(newValue))
        break
      case 'hashmarks':
        my.observed.Hashmarks = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })

  toRender(() => {
    let { Value, Minimum,Maximum, Stepping, Hashmarks } = my.observed
    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Hashmarks.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Hashmarks.map((Item) => {
          const Label = Item.replace(/:.*$/,'').trim()
          const Value = Item.replace(/^[^:]+:/,'').trim()

          return html`<option label=${Label} value=${Value}></option>`
        })}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = parseFloat(Event.target.value)
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="range" list=${UUID} disabled=${! my.observed.enabled}
        value=${isNaN(Value) ? '' : Value}
        min=${Minimum} max=${Maximum} step=${Stepping}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },['Value','Minimum','Maximum','Stepping','Hashmarks','enabled']
  )



  registerBehaviour('native-Textline-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                        rsc-native-textline-input                         --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:'',
    minLength:0, maxLength:undefined,
    Pattern:undefined, Placeholder:undefined, readonly:false,
    SpellChecking:'default', Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowTextline('input value',newValue)
      my.unobserved.Value = newValue
    },

    get minLength () { return my.unobserved.minLength },
    set minLength (newValue) {
      JIL.allowOrdinal('minimal input length',newValue)
      my.unobserved.minLength = newValue
    },

    get maxLength () { return my.unobserved.maxLength },
    set maxLength (newValue) {
      JIL.allowOrdinal('maximal input length',newValue)
      my.unobserved.maxLength = newValue
    },

    get Pattern () { return my.unobserved.Pattern },
    set Pattern (newValue) {
      JIL.allowTextline('input pattern',newValue)
      my.unobserved.Pattern = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get SpellChecking () { return my.unobserved.SpellChecking },
    set SpellChecking (newValue) {
      JIL.expectOneOf('spell-check setting',newValue,['default','enabled','disabled'])
      my.unobserved.SpellChecking = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, JIL.ValueIsTextline)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'min-length': my.observed.minLength = parsed(newValue); break
      case 'max-length': my.observed.maxLength = parsed(newValue); break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.trim().split(/[\r]?\n/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, minLength,maxLength, Pattern, Placeholder, readonly, SpellChecking,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    SpellChecking = (
      SpellChecking === 'default' ? undefined : (SpellChecking === 'enabled')
    )

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="text" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value} minlength=${minLength} maxlength=${maxLength}
        pattern=${Pattern} placeholder=${Placeholder}
        spellcheck=${SpellChecking} readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','minLength','maxLength','Pattern','Placeholder','readonly',
      'SpellChecking','Suggestions','enabled'
    ]
  )


  registerBehaviour('native-Password-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                        rsc-native-password-input                         --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:'',
    minLength:0, maxLength:undefined,
    Pattern:undefined, Placeholder:undefined, readonly:false,
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowTextline('input value',newValue)
      my.unobserved.Value = newValue
    },

    get minLength () { return my.unobserved.minLength },
    set minLength (newValue) {
      JIL.allowOrdinal('minimal input length',newValue)
      my.unobserved.minLength = newValue
    },

    get maxLength () { return my.unobserved.maxLength },
    set maxLength (newValue) {
      JIL.allowOrdinal('maximal input length',newValue)
      my.unobserved.maxLength = newValue
    },

    get Pattern () { return my.unobserved.Pattern },
    set Pattern (newValue) {
      JIL.allowTextline('input pattern',newValue)
      my.unobserved.Pattern = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'min-length': my.observed.minLength = parsed(newValue); break
      case 'max-length': my.observed.maxLength = parsed(newValue); break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let { Value, minLength,maxLength, Pattern, Placeholder, readonly } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="password" disabled=${! my.observed.enabled}
        value=${Value} minlength=${minLength} maxlength=${maxLength}
        pattern=${Pattern} placeholder=${Placeholder} readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
    `
  })


    },[
      'Value','minLength','maxLength','Pattern','Placeholder','readonly',
      'enabled'
    ]
  )


  registerBehaviour('native-Number-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                        rsc-native-number-input                         --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:undefined,
    Minimum:undefined, Maximum:undefined, Stepping:'any',
    Pattern:undefined, Placeholder:undefined, readonly:false,
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowNumber('input value',newValue)
      my.unobserved.Value = newValue
    },

    get Minimum () { return my.unobserved.Minimum },
    set Minimum (newValue) {
      JIL.allowNumber('minimal input value',newValue)
      my.unobserved.Minimum = newValue
    },

    get Maximum () { return my.unobserved.Maximum },
    set Maximum (newValue) {
      JIL.allowNumber('maximal input value',newValue)
      my.unobserved.Maximum = newValue
    },

    get Stepping () { return my.unobserved.Stepping },
    set Stepping (newValue) {
      if (newValue !== 'any') {
        JIL.allowNumber('step value',newValue)
      }
      my.unobserved.Stepping = newValue
    },

    get Pattern () { return my.unobserved.Pattern },
    set Pattern (newValue) {
      JIL.allowTextline('input pattern',newValue)
      my.unobserved.Pattern = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, JIL.ValueIsNumber)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'value':   my.observed.Value   = parsed(newValue); break
      case 'minimum': my.observed.Minimum = parsed(newValue); break
      case 'maximum': my.observed.Maximum = parsed(newValue); break
      case 'stepping':
        my.observed.Stepping = (newValue === 'any' ? 'any' : parsed(newValue))
        break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)|(?:\s+)/)
              .map((Value) => parseFloat(Value))
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, Minimum,Maximum,Stepping, Pattern, Placeholder, readonly, Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = parseFloat(Event.target.value)
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="text" list=${UUID} disabled=${! my.observed.enabled}
        value=${isNaN(Value) ? '' : Value}
        min=${Minimum} max=${Maximum} step=${Stepping}
        pattern=${Pattern} placeholder=${Placeholder} readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','Minimum','Maximum','Stepping','Pattern','Placeholder','readonly',
      'Suggestions','enabled'
    ]
  )


  registerBehaviour('native-PhoneNumber-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                       rsc-native-phonenumber-input                       --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:'',
    minLength:0, maxLength:undefined,
    Pattern:undefined, Placeholder:undefined, readonly:false,
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowTextline('input value',newValue)
      my.unobserved.Value = newValue
    },

    get minLength () { return my.unobserved.minLength },
    set minLength (newValue) {
      JIL.allowOrdinal('minimal input length',newValue)
      my.unobserved.minLength = newValue
    },

    get maxLength () { return my.unobserved.maxLength },
    set maxLength (newValue) {
      JIL.allowOrdinal('maximal input length',newValue)
      my.unobserved.maxLength = newValue
    },

    get Pattern () { return my.unobserved.Pattern },
    set Pattern (newValue) {
      JIL.allowTextline('input pattern',newValue)
      my.unobserved.Pattern = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, JIL.ValueIsTextline)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'min-length': my.observed.minLength = parsed(newValue); break
      case 'max-length': my.observed.maxLength = parsed(newValue); break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, minLength,maxLength, Pattern, Placeholder, readonly,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="tel" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value} minlength=${minLength} maxlength=${maxLength}
        pattern=${Pattern} placeholder=${Placeholder}
        readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','minLength','maxLength','Pattern','Placeholder','readonly',
      'Suggestions','enabled'
    ]
  )


  registerBehaviour('native-EMailAddress-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                      rsc-native-emailaddress-input                       --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:[], multiple:false,                      // "Value" is always an array
    minLength:0, maxLength:undefined,
    Pattern:undefined, Placeholder:undefined, readonly:false,
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value.slice() },
    set Value (newValue) {
      JIL.allowListSatisfying('input value list',newValue, JIL.ValueIsEMailAddress)
      my.unobserved.Value = (newValue == null ? [] : newValue.slice())
    },

    get multiple () { return my.unobserved.multiple },
    set multiple (newValue) {
      JIL.expectBoolean('multiplicity setting',newValue)
      my.unobserved.multiple = newValue
    },

    get minLength () { return my.unobserved.minLength },
    set minLength (newValue) {
      JIL.allowOrdinal('minimal input length',newValue)
      my.unobserved.minLength = newValue
    },

    get maxLength () { return my.unobserved.maxLength },
    set maxLength (newValue) {
      JIL.allowOrdinal('maximal input length',newValue)
      my.unobserved.maxLength = newValue
    },

    get Pattern () { return my.unobserved.Pattern },
    set Pattern (newValue) {
      JIL.allowTextline('input pattern',newValue)
      my.unobserved.Pattern = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, JIL.ValueIsEMailAddress)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'value':
        my.observed.Value = (newValue || '').trim().split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)/)
        break
      case 'multiple':
        my.observed.multiple = (newValue === 'multiple') || (newValue === '')
        break
      case 'min-length': my.observed.minLength = parsed(newValue); break
      case 'max-length': my.observed.maxLength = parsed(newValue); break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.trim().split(/[\r]?\n/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, multiple, minLength,maxLength, Pattern, Placeholder, readonly,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue || []
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value.trim().split(/\s*,\s*/)
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="email" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value.join(',')} minlength=${minLength} maxlength=${maxLength}
        pattern=${Pattern} placeholder=${Placeholder}
        readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','multiple','minLength','maxLength','Pattern','Placeholder',
      'readonly','Suggestions','enabled'
    ]
  )


  registerBehaviour('native-URL-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                           rsc-native-url-input                           --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:'',
    minLength:0, maxLength:undefined,
    Pattern:undefined, Placeholder:undefined, readonly:false,
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowURL('input value',newValue)
      my.unobserved.Value = newValue
    },

    get minLength () { return my.unobserved.minLength },
    set minLength (newValue) {
      JIL.allowOrdinal('minimal input length',newValue)
      my.unobserved.minLength = newValue
    },

    get maxLength () { return my.unobserved.maxLength },
    set maxLength (newValue) {
      JIL.allowOrdinal('maximal input length',newValue)
      my.unobserved.maxLength = newValue
    },

    get Pattern () { return my.unobserved.Pattern },
    set Pattern (newValue) {
      JIL.allowTextline('input pattern',newValue)
      my.unobserved.Pattern = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, JIL.ValueIsURL)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'min-length': my.observed.minLength = parsed(newValue); break
      case 'max-length': my.observed.maxLength = parsed(newValue); break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)|(?:\s+)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, minLength,maxLength, Pattern, Placeholder, readonly,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="url" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value} minlength=${minLength} maxlength=${maxLength}
        pattern=${Pattern} placeholder=${Placeholder}
        readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','minLength','maxLength','Pattern','Placeholder','readonly',
      'Suggestions','enabled'
    ]
  )


  registerBehaviour('native-Time-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                          rsc-native-time-input                           --
//------------------------------------------------------------------------------

  const TimePattern = '\\d{2}:\\d{2}'
  const TimeRegExp  = /\d{2}:\d{2}/

  function TimeMatcher (Value) {
    return JIL.ValueIsStringMatching(Value,TimeRegExp)
  }

  RSC.assign(my.unobserved,{
    Value:'',
    Minimum:0, Maximum:undefined, Stepping:1,
    Placeholder:undefined, readonly:false,
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowStringMatching('input value',newValue,TimeRegExp)
      my.unobserved.Value = newValue
    },

    get Minimum () { return my.unobserved.Minimum },
    set Minimum (newValue) {
      JIL.allowStringMatching('minimal input value',newValue,TimeRegExp)
      my.unobserved.Minimum = newValue
    },

    get Maximum () { return my.unobserved.Maximum },
    set Maximum (newValue) {
      JIL.allowStringMatching('maximal input value',newValue,TimeRegExp)
      my.unobserved.Maximum = newValue
    },

    get Stepping () { return my.unobserved.Stepping },
    set Stepping (newValue) {
      if (newValue !== 'any') {
        JIL.allowNumber('step value',newValue)
      }
      my.unobserved.Stepping = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, TimeMatcher)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'stepping':
        my.observed.Stepping = (newValue === 'any' ? 'any' : parsed(newValue))
        break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)|(?:\s+)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, Minimum,Maximum, Stepping, Placeholder, readonly,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="time" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value} min=${Minimum} max=${Maximum} step=${Stepping}
        pattern=${TimePattern} placeholder=${Placeholder} readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','Minimum','Maximum','Stepping','Placeholder','readonly',
      'Suggestions','enabled'
    ]
  )


  registerBehaviour('native-DateTime-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                        rsc-native-datetime-input                         --
//------------------------------------------------------------------------------

  const DateTimePattern = '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}'
  const DateTimeRegExp  = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

  function DateTimeMatcher (Value) {
    return JIL.ValueIsStringMatching(Value,DateTimeRegExp)
  }

  RSC.assign(my.unobserved,{
    Value:'',
    Minimum:0, Maximum:undefined, Stepping:1,
    Placeholder:undefined, readonly:false,
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowStringMatching('input value',newValue,DateTimeRegExp)
      my.unobserved.Value = newValue
    },

    get Minimum () { return my.unobserved.Minimum },
    set Minimum (newValue) {
      JIL.allowStringMatching('minimal input value',newValue,DateTimeRegExp)
      my.unobserved.Minimum = newValue
    },

    get Maximum () { return my.unobserved.Maximum },
    set Maximum (newValue) {
      JIL.allowStringMatching('maximal input value',newValue,DateTimeRegExp)
      my.unobserved.Maximum = newValue
    },

    get Stepping () { return my.unobserved.Stepping },
    set Stepping (newValue) {
      if (newValue !== 'any') {
        JIL.allowNumber('step value',newValue)
      }
      my.unobserved.Stepping = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, DateTimeMatcher)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'stepping':
        my.observed.Stepping = (newValue === 'any' ? 'any' : parsed(newValue))
        break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)|(?:\s+)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, Minimum,Maximum, Stepping, Placeholder, readonly,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="datetime-local" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value} min=${Minimum} max=${Maximum} step=${Stepping}
        pattern=${DateTimePattern} placeholder=${Placeholder} readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','Minimum','Maximum','Stepping','Placeholder','readonly',
      'Suggestions','enabled'
    ]
  )


  registerBehaviour('native-Date-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                          rsc-native-date-input                           --
//------------------------------------------------------------------------------

  const DatePattern = '\\d{4}-\\d{2}-\\d{2}'
  const DateRegExp  = /\d{4}-\d{2}-\d{2}/

  function DateMatcher (Value) {
    return JIL.ValueIsStringMatching(Value,DateRegExp)
  }

  RSC.assign(my.unobserved,{
    Value:'',
    Minimum:0, Maximum:undefined, Stepping:1,
    Placeholder:undefined, readonly:false,
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowStringMatching('input value',newValue,DateRegExp)
      my.unobserved.Value = newValue
    },

    get Minimum () { return my.unobserved.Minimum },
    set Minimum (newValue) {
      JIL.allowStringMatching('minimal input value',newValue,DateRegExp)
      my.unobserved.Minimum = newValue
    },

    get Maximum () { return my.unobserved.Maximum },
    set Maximum (newValue) {
      JIL.allowStringMatching('maximal input value',newValue,DateRegExp)
      my.unobserved.Maximum = newValue
    },

    get Stepping () { return my.unobserved.Stepping },
    set Stepping (newValue) {
      if (newValue !== 'any') {
        JIL.allowNumber('step value',newValue)
      }
      my.unobserved.Stepping = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, DateMatcher)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'stepping':
        my.observed.Stepping = (newValue === 'any' ? 'any' : parsed(newValue))
        break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)|(?:\s+)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, Minimum,Maximum, Stepping, Placeholder, readonly,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="date" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value} min=${Minimum} max=${Maximum} step=${Stepping}
        pattern=${DatePattern} placeholder=${Placeholder} readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','Minimum','Maximum','Stepping','Placeholder','readonly',
      'Suggestions','enabled'
    ]
  )


  registerBehaviour('native-Week-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                          rsc-native-week-input                           --
//------------------------------------------------------------------------------

  const WeekPattern = '\\d{4}-W\\d{2}'
  const WeekRegExp  = /\d{4}-W\d{2}/

  function WeekMatcher (Value) {
    return JIL.ValueIsStringMatching(Value,WeekRegExp)
  }

  RSC.assign(my.unobserved,{
    Value:'',
    Minimum:0, Maximum:undefined, Stepping:1,
    Placeholder:undefined, readonly:false,
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowStringMatching('input value',newValue,WeekRegExp)
      my.unobserved.Value = newValue
    },

    get Minimum () { return my.unobserved.Minimum },
    set Minimum (newValue) {
      JIL.allowStringMatching('minimal input value',newValue,WeekRegExp)
      my.unobserved.Minimum = newValue
    },

    get Maximum () { return my.unobserved.Maximum },
    set Maximum (newValue) {
      JIL.allowStringMatching('maximal input value',newValue,WeekRegExp)
      my.unobserved.Maximum = newValue
    },

    get Stepping () { return my.unobserved.Stepping },
    set Stepping (newValue) {
      if (newValue !== 'any') {
        JIL.allowNumber('step value',newValue)
      }
      my.unobserved.Stepping = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, WeekMatcher)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'stepping':
        my.observed.Stepping = (newValue === 'any' ? 'any' : parsed(newValue))
        break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)|(?:\s+)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, Minimum,Maximum, Stepping, Placeholder, readonly,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="week" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value} min=${Minimum} max=${Maximum} step=${Stepping}
        pattern=${WeekPattern} placeholder=${Placeholder} readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','Minimum','Maximum','Stepping','Placeholder','readonly',
      'Suggestions','enabled'
    ]
  )


  registerBehaviour('native-Month-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                          rsc-native-month-input                          --
//------------------------------------------------------------------------------

  const MonthPattern = '\\d{4}-\\d{2}'
  const MonthRegExp  = /\d{4}-\d{2}/

  function MonthMatcher (Value) {
    return JIL.ValueIsStringMatching(Value,MonthRegExp)
  }

  RSC.assign(my.unobserved,{
    Value:'',
    Minimum:0, Maximum:undefined, Stepping:1,
    Placeholder:undefined, readonly:false,
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowStringMatching('input value',newValue,MonthRegExp)
      my.unobserved.Value = newValue
    },

    get Minimum () { return my.unobserved.Minimum },
    set Minimum (newValue) {
      JIL.allowStringMatching('minimal input value',newValue,MonthRegExp)
      my.unobserved.Minimum = newValue
    },

    get Maximum () { return my.unobserved.Maximum },
    set Maximum (newValue) {
      JIL.allowStringMatching('maximal input value',newValue,MonthRegExp)
      my.unobserved.Maximum = newValue
    },

    get Stepping () { return my.unobserved.Stepping },
    set Stepping (newValue) {
      if (newValue !== 'any') {
        JIL.allowNumber('step value',newValue)
      }
      my.unobserved.Stepping = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, MonthMatcher)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'stepping':
        my.observed.Stepping = (newValue === 'any' ? 'any' : parsed(newValue))
        break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)|(?:\s+)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, Minimum,Maximum, Stepping, Placeholder, readonly,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="month" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value} min=${Minimum} max=${Maximum} step=${Stepping}
        pattern=${MonthPattern} placeholder=${Placeholder} readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','Minimum','Maximum','Stepping','Placeholder','readonly',
      'Suggestions','enabled'
    ]
  )


  registerBehaviour('native-Search-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                         rsc-native-search-input                          --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:'',
    minLength:0, maxLength:undefined,
    Pattern:undefined, Placeholder:undefined, readonly:false,
    SpellChecking:'default', Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowTextline('input value',newValue)
      my.unobserved.Value = newValue
    },

    get minLength () { return my.unobserved.minLength },
    set minLength (newValue) {
      JIL.allowOrdinal('minimal input length',newValue)
      my.unobserved.minLength = newValue
    },

    get maxLength () { return my.unobserved.maxLength },
    set maxLength (newValue) {
      JIL.allowOrdinal('maximal input length',newValue)
      my.unobserved.maxLength = newValue
    },

    get Pattern () { return my.unobserved.Pattern },
    set Pattern (newValue) {
      JIL.allowTextline('input pattern',newValue)
      my.unobserved.Pattern = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get SpellChecking () { return my.unobserved.SpellChecking },
    set SpellChecking (newValue) {
      JIL.expectOneOf('spell-check setting',newValue,['default','enabled','disabled'])
      my.unobserved.SpellChecking = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, JIL.ValueIsTextline)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'min-length': my.observed.minLength = parsed(newValue); break
      case 'max-length': my.observed.maxLength = parsed(newValue); break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, minLength,maxLength, Pattern, Placeholder, readonly, SpellChecking,
      Suggestions
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    SpellChecking = (
      SpellChecking === 'default' ? undefined : (SpellChecking === 'enabled')
    )

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="search" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value} minlength=${minLength} maxlength=${maxLength}
        pattern=${Pattern} placeholder=${Placeholder}
        spellcheck=${SpellChecking} readonly=${readonly}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },[
      'Value','minLength','maxLength','Pattern','Placeholder','readonly',
      'SpellChecking','Suggestions','enabled'
    ]
  )



  registerBehaviour('native-Color-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                          rsc-native-color-input                          --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:'',
    Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowColor('input value',newValue)
      my.unobserved.Value = newValue
    },

    get Suggestions () { return my.unobserved.Suggestions.slice() },
    set Suggestions (newValue) {
      JIL.allowListSatisfying('list of suggestions',newValue, JIL.ValueIsTextline)
      my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    switch (Name) {
      case 'suggestions':
        my.observed.Suggestions = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let { Value, Suggestions } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    let DataList, UUID
    if (Suggestions.length > 0) {
      UUID = my.unobserved.UUID
      if (UUID == null) { UUID = RSC.newUUID() }

      DataList = html`<datalist id=${UUID}>
        ${Suggestions.map((Value) => html`<option value=${Value}></option>`)}
      </datalist>`
    }

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <input type="color" list=${UUID} disabled=${! my.observed.enabled}
        value=${Value}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      />
      ${DataList}
    `
  })


    },['Value','Suggestions','enabled']
  )


  registerBehaviour('native-DropDown',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                           rsc-native-dropdown                            --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:[],      // internally, "Value" is always a list, even if (! multiple)
    multiple:false, Options:[],
    enabled:true,
  }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

  RSC.assign(my.observed,{
    get Value () {
      const { Value,multiple,Options } = my.unobserved
      const ValueList = Value.filter((Item) => Options.indexOf(Item) >= 0)
      return (multiple ? ValueList : ValueList[0])
    },
    set Value (newValue) {         // deliberately not yet matched with Options!
      if (Array.isArray(newValue)) {
        JIL.expectListSatisfying('input value list',newValue,JIL.ValueIsTextline)
        my.unobserved.Value = newValue.slice()
      } else {
        JIL.allowTextline('input value',newValue)
        my.unobserved.Value = (newValue == null ? [] : [newValue])
      }
    },

    get multiple () { return my.unobserved.multiple },
    set multiple (newValue) {
      JIL.expectBoolean('multiplicity setting',newValue)
      my.unobserved.multiple = newValue
    },

    get Options () { return my.unobserved.Options.slice() },
    set Options (newValue) {
      JIL.allowListSatisfying('list of options',newValue, JIL.ValueIsTextline)
      my.unobserved.Options = (newValue == null ? [] : newValue.slice())
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'multiple':
        my.observed.multiple = (newValue === 'multiple') || (newValue === '')
        break
      case 'options':
        my.observed.Options = (
          JIL.ValueIsNonEmptyString(newValue)
          ? newValue.split(/(?:[ \t]*[\r]?\n[ \t]*)|(?:\s*,\s*)/)
          : []
        )
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let Value = my.unobserved.Value  // "my.unobserved.Value" is always an array

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    const ValueSet = Object.create(null)
      Value.forEach((Value) => ValueSet[Value] = true )

    let { multiple, Options } = my.observed

    let OptionList = Options.map((Option) => {
      const Label = Option.replace(/:.*$/,'').trim()// works even for options...
      const Value = Option.replace(/^\s*[^:]+:/,'').trim()  // ...without colon!
      return { Label,Value }
    })

    function onInput (Event) {
      my.renderedValue = Array.from(Event.target.options)
        .filter((Option) => Option.selected)
        .map((Option) => Option.value)
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <select disabled=${! my.observed.enabled}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      >
        ${OptionList.map(({ Label,Value }) => {
          return html`<option value=${Value} selected=${Value in ValueSet}>${Label}</option>`
        })}
      </>
    `
  })


    },['Value','multiple','Options','enabled']
  )


  registerBehaviour('native-Text-Input',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                          rsc-native-text-input                           --
//------------------------------------------------------------------------------

  RSC.assign(my.unobserved,{
    Value:'',
    minLength:0, maxLength:undefined,
    Pattern:undefined, Placeholder:undefined, readonly:false,
    SpellChecking:'default', Suggestions:[],
    enabled:true,
    UUID:undefined // is used internally - do not touch!
  }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

  RSC.assign(my.observed,{
    get Value () { return my.unobserved.Value },
    set Value (newValue) {
      JIL.allowText('input value',newValue)
      my.unobserved.Value = newValue
    },

    get LineWrapping () { return my.unobserved.LineWrapping },
    set LineWrapping (newValue) {
      JIL.expectBoolean('line wrap setting',newValue)
      my.unobserved.LineWrapping = newValue
    },

    get resizable () { return my.unobserved.resizable },
    set resizable (newValue) {
      JIL.expectBoolean('resizability setting',newValue)
      my.unobserved.resizable = newValue
    },

    get minLength () { return my.unobserved.minLength },
    set minLength (newValue) {
      JIL.allowOrdinal('minimal input length',newValue)
      my.unobserved.minLength = newValue
    },

    get maxLength () { return my.unobserved.maxLength },
    set maxLength (newValue) {
      JIL.allowOrdinal('maximal input length',newValue)
      my.unobserved.maxLength = newValue
    },

    get Placeholder () { return my.unobserved.Placeholder },
    set Placeholder (newValue) {
      JIL.allowTextline('input placeholder',newValue)
      my.unobserved.Placeholder = newValue
    },

    get readonly () { return my.unobserved.readonly },
    set readonly (newValue) {
      JIL.expectBoolean('read-only setting',newValue)
      my.unobserved.readonly = newValue
    },

    get SpellChecking () { return my.unobserved.SpellChecking },
    set SpellChecking (newValue) {
      JIL.expectOneOf('spell-check setting',newValue,['default','enabled','disabled'])
      my.unobserved.SpellChecking = newValue
    },

    get enabled () { return my.unobserved.enabled },
    set enabled (newValue) {
      JIL.expectBoolean('enable setting',newValue)
      my.unobserved.enabled = newValue
    },
  })

  onAttributeChange((Name, newValue) => {
    function parsed (Value) {
      return ((Value || '').trim() === '' ? undefined : parseFloat(Value))
    }

    switch (Name) {
      case 'min-length': my.observed.minLength = parsed(newValue); break
      case 'max-length': my.observed.maxLength = parsed(newValue); break
      case 'readonly':
        my.observed.readonly = (newValue === 'readonly') || (newValue === '')
        break
      case 'line-wrapping':
        my.observed.LineWrapping = (newValue === 'line-wrapping') || (newValue === '')
        break
      case 'resizable':
        my.observed.resizable = (newValue === 'resizable') || (newValue === '')
        break
      case 'enabled':
        my.observed.enabled = (newValue === 'enabled') || (newValue === '')
        break
      default: return false // triggers automatic mapping
    }
    return true
  })


  toRender(() => {
    let {
      Value, LineWrapping, resizable, minLength,maxLength,
      Placeholder, readonly, SpellChecking
    } = my.observed

    if (document.activeElement === me) {
      Value = my.renderedValue
    } else {
      my.renderedValue = Value
    }

    if (LineWrapping === 'none') { LineWrapping = undefined }

    SpellChecking = (
      SpellChecking === 'default' ? undefined : (SpellChecking === 'enabled')
    )

    const Style = (resizable ? 'resize:both' : 'resize:none')

    function onInput (Event) {
      my.renderedValue  = Event.target.value
      my.observed.Value = my.renderedValue
    }

    return html`
      <style>
        :host { display:inline-block }
      </style>
      <textarea disabled=${! my.observed.enabled} style=${Style}
        readonly=${readonly} wrap=${LineWrapping}
        minlength=${minLength} maxlength=${maxLength}
        placeholder=${Placeholder} spellcheck=${SpellChecking}
        onInput=${onInput} onBlur=${my.render.bind(me)}
      >${Value}</>
    `
  })


    },[
      'Value','LineWrapping','resizable','minLength','maxLength','Placeholder',
      'readonly','SpellChecking','enabled'
    ]
  )


  registerBehaviour('Applet',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                                rsc-applet                                --
//------------------------------------------------------------------------------

  toRender(() => html`
    <style>
      :host {
        display:inline-block; position:relative;
      }
    </style>
    <slot/>
  `)


    },[]
  )

  registerBehaviour('Title',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                                rsc-title                                 --
//------------------------------------------------------------------------------

  toRender(() => html`
    <style>
      :host {
        display:inline-block; position:relative;
      }
    </style>
    <slot/>
  `)


    },[]
  )

  registerBehaviour('Label',
    function (
      my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ) {
//------------------------------------------------------------------------------
//--                                rsc-label                                 --
//------------------------------------------------------------------------------

  toRender(() => html`
    <style>
      :host {
        display:inline-block; position:relative;
      }
    </style>
    <slot/>
  `)


    },[]
  )

