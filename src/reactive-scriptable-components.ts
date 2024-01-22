/*******************************************************************************
*                                                                              *
*           Reactive Scriptable Components (RSC, pronounced "resc")            *
*                                                                              *
*******************************************************************************/

import * as JIL from 'javascript-interface-library'

import {
  throwError,
  quoted,
  ObjectIsEmpty,
  ValueIsBoolean,
  ValueIsNumber, ValueIsNumberInRange, ValueIsInteger, ValueIsIntegerInRange,
  ValueIsString, ValueIsStringMatching, ValueIsTextline, ValueIsText,
  ValueIsFunction,
  ValueIsObject, ValueIsArray,
  ValueIsListSatisfying,
  ValueIsURL,
  ValidatorForClassifier, acceptNil, rejectNil,
  expectText, expectTextline, expectedTextline,
  expectFunction,
  allowListSatisfying,
  expectInstanceOf,
} from 'javascript-interface-library'

import { render, html, Component } from 'htm/preact'

import hyperactiv from 'hyperactiv'
const { observe, computed, dispose } = hyperactiv

/**** hide all undefined custom elements (to avoid initial flashing) ****/

  const Stylesheet = document.createElement('style')
    Stylesheet.innerHTML = ':not(:defined) { visibility:hidden }'
  document.head.appendChild(Stylesheet)

/**** make some existing types indexable ****/

  interface Indexable { [Key:string]:any }

  type indexableFunction    = Function    & Indexable
  type indexableElement     = Element     & Indexable
  type indexableHTMLElement = HTMLElement & Indexable
  type indexableEvent       = Event       & Indexable

namespace RSC {
  export const assign = JIL.ObjectMergedWith

/**** isRunning ****/

  let RSC_isRunning:boolean = false

  export function isRunning () { return RSC_isRunning }

//------------------------------------------------------------------------------
//--                             Type Definitions                             --
//------------------------------------------------------------------------------

  export type Textline = string              // mainly for illustrative purposes
  export type Text     = string                                          // dto.
  export type URL      = string                                          // dto.

  export type RSC_UUID = string                                          // dto.
  export type RSC_Name = string                                          // dto.

/**** throwReadOnlyError ****/

  export function throwReadOnlyError (Name:string):never {
    throwError(
      'ReadOnlyProperty: property ' + quoted(Name) + ' must not be set'
    )
  }

//------------------------------------------------------------------------------
//--                 Classification and Validation Functions                  --
//------------------------------------------------------------------------------

/**** ValueIsDOMElement ****/

  export function ValueIsDOMElement (Value:any):boolean {
    return (Value instanceof Element)
  }

/**** allow/expect[ed]DOMElement ****/

  export const allowDOMElement = ValidatorForClassifier(
    ValueIsDOMElement, acceptNil, 'DOM element'
  ), allowedDOMElement = allowDOMElement

  export const expectDOMElement = ValidatorForClassifier(
    ValueIsDOMElement, rejectNil, 'DOM element'
  ), expectedDOMElement = expectDOMElement

/**** ValueIsVisual ****/

  export function ValueIsVisual (Value:any):boolean {
    return (Value instanceof RSC_Visual)
  }

/**** allow/expect[ed]Visual ****/

  export const allowVisual = ValidatorForClassifier(
    ValueIsVisual, acceptNil, 'RSC visual'
  ), allowedVisual = allowVisual

  export const expectVisual = ValidatorForClassifier(
    ValueIsVisual, rejectNil, 'RSC visual'
  ), expectedVisual = expectVisual

/**** ValueIsName ****/

  const RSC_NamePattern = /^[a-z$_][a-z$_0-9]*(-[a-z$_0-9]+)*$/i

  export function ValueIsName (Value:any):boolean {
    return ValueIsStringMatching(Value, RSC_NamePattern)
  }

/**** allow/expect[ed]Name ****/

  export const allowName = ValidatorForClassifier(
    ValueIsName, acceptNil, 'RSC name'
  ), allowedName = allowName

  export const expectName = ValidatorForClassifier(
    ValueIsName, rejectNil, 'RSC name'
  ), expectedName = expectName

/**** ValueIsErrorInfo ****/

  export function ValueIsErrorInfo (Value:any):boolean {
    return (
      ValueIsObject(Value) &&
      ValueIsTextline(Value.Title) &&
      ValueIsText(Value.Message)
    )
  }

/**** allow/expect[ed]ErrorInfo ****/

  export const allowErrorInfo = ValidatorForClassifier(
    ValueIsErrorInfo, acceptNil, 'RSC error information record'
  ), allowedErrorInfo = allowErrorInfo

  export const expectErrorInfo = ValidatorForClassifier(
    ValueIsErrorInfo, rejectNil, 'RSC error information record'
  ), expectedErrorInfo = expectErrorInfo

//------------------------------------------------------------------------------
//--                        Value Acceptance Functions                        --
//------------------------------------------------------------------------------

/**** acceptableBoolean ****/

  export function acceptableBoolean (Value:any, Default:boolean):boolean {
    return (ValueIsBoolean(Value) ? Value : Default)
  }

/**** acceptableNumber ****/

  export function acceptableNumber (Value:any, Default:number) {
    return (ValueIsNumber(Value) ? Value : Default)
  }

/**** acceptableNumberInRange ****/

  export function acceptableNumberInRange (
    Value:any, Default:number,
    minValue:number = -Infinity, maxValue:number = Infinity,
    withMin:boolean = false, withMax:boolean = false
  ) {
    return (
      ValueIsNumberInRange(Value,minValue,maxValue,withMin,withMax) ? Value : Default
    )
  }

/**** acceptableInteger ****/

  export function acceptableInteger (Value:any, Default:number) {
    return (ValueIsInteger(Value) ? Value : Default)
  }

/**** acceptableIntegerInRange ****/

  export function acceptableIntegerInRange (
    Value:any, Default:number,
    minValue:number = -Infinity, maxValue:number = Infinity
  ) {
    return (ValueIsIntegerInRange(Value,minValue,maxValue) ? Value : Default)
  }

/**** acceptableString ****/

  export function acceptableString (Value:any, Default:string) {
    return (ValueIsString(Value) ? Value : Default)
  }

/**** acceptableNonEmptyString ****/

  export function acceptableNonEmptyString (Value:any, Default:string) {
    return (ValueIsString(Value) && (Value.trim() !== '') ? Value : Default)
  }

/**** acceptableStringMatching ****/

  export function acceptableStringMatching (
    Value:any, Default:string, Pattern:RegExp
  ) {
    return (ValueIsStringMatching(Value,Pattern) ? Value : Default)
  }

/**** acceptableURL ****/

  export function acceptableURL (Value:any, Default:URL):URL {
    return (ValueIsURL(Value) ? Value : Default)
  }

/**** newUUID ****/

  export function newUUID ():RSC_UUID {
    let Id = '', IdPart
    IdPart = Math.round(Math.random()*0xffffffff).toString(16)
      Id += IdPart + '00000000'.slice(IdPart.length) + '-'
      IdPart = Math.round(Math.random()*0xffff).toString(16)
      Id += IdPart + '0000'.slice(IdPart.length) + '-4'
      IdPart = Math.round(Math.random()*0xfff).toString(16)
      Id += IdPart + '000'.slice(IdPart.length) + '-'
      IdPart = Math.round(Math.random()*0x3fff+0x8000).toString(16)
      Id += IdPart + '-'
      IdPart = Math.round(Math.random()*0xffffffffffff).toString(16)
      Id += IdPart + '000000000000'.slice(IdPart.length)
    return Id.toLowerCase()
  }

//------------------------------------------------------------------------------
//--                      Initialization Marker Handling                      --
//------------------------------------------------------------------------------

  const InitializationMarkerForVisual:WeakMap<RSC_Visual,boolean> = new WeakMap()

/**** VisualWasInitialized ****/

  function VisualWasInitialized (Visual:RSC_Visual):boolean {
    return (InitializationMarkerForVisual.get(Visual) === true)
  }

/**** markVisualAsInitialized ****/

  function markVisualAsInitialized (Visual:RSC_Visual):void {
    InitializationMarkerForVisual.set(Visual,true)
  }

//------------------------------------------------------------------------------
//--                           Containment Handling                           --
//------------------------------------------------------------------------------

/**** outerVisualOf ****/

  export function outerVisualOf (DOMElement:HTMLElement):RSC_Visual|undefined {
    expectDOMElement('element',DOMElement)

    DOMElement = DOMElement.parentElement as HTMLElement
    while (DOMElement != null) {
      if (ValueIsVisual(DOMElement)) {
        return DOMElement as RSC_Visual
      }
      DOMElement = DOMElement.parentElement as HTMLElement
    }

    return undefined
  }

  export const VisualContaining = outerVisualOf

/**** outermostVisualOf ****/

  export function outermostVisualOf (DOMElement:HTMLElement):RSC_Visual|undefined {
    expectDOMElement('element',DOMElement)

    let outermostVisual:RSC_Visual|undefined = undefined
      DOMElement = DOMElement.parentElement as HTMLElement
      while (DOMElement != null) {
        if (ValueIsVisual(DOMElement)) {
          outermostVisual = DOMElement as RSC_Visual
        }
        DOMElement = DOMElement.parentElement as HTMLElement
      }
    return outermostVisual
  }

/**** closestVisualWithBehaviour ****/

  export function closestVisualWithBehaviour (
    DOMElement:HTMLElement, BehaviourName:RSC_Name
  ):RSC_Visual|undefined {
    expectDOMElement ('element',DOMElement)
    expectName('behaviour name',BehaviourName)

    const normalizedName = BehaviourName.toLowerCase()
    while (DOMElement != null) {
      if (
        ValueIsVisual(DOMElement) &&
        ((BehaviourNameOfVisual(DOMElement as RSC_Visual) || '').toLowerCase() === normalizedName)
      ) {
        return DOMElement as RSC_Visual
      }
      DOMElement = outerVisualOf(DOMElement) as HTMLElement
    }
    return undefined
  }

/**** closestVisualMatching ****/

  export function closestVisualMatching (
    DOMElement:HTMLElement, Selector:Textline
  ):RSC_Visual|undefined {
    expectDOMElement   ('element',DOMElement)
    expectTextline('CSS selector',Selector)

    while (DOMElement != null) {
      if (ValueIsVisual(DOMElement) && DOMElement.matches(Selector)) {
        return DOMElement as RSC_Visual
      }
      DOMElement = outerVisualOf(DOMElement) as HTMLElement
    }
    return undefined
  }

/**** innerElementsOf ****/

  function innerElementsOf (DOMElement:HTMLElement):Element[] {
    return Array.from(DOMElement.children)
  }

/**** innerVisualsOf ****/

  export function innerVisualsOf (DOMElement:HTMLElement):RSC_Visual[] {
    expectDOMElement('element',DOMElement)

    const innerVisuals = Array.from(DOMElement.children)
      .filter((innerElement) => ValueIsVisual(innerElement))
    return innerVisuals as RSC_Visual[]
  }

//------------------------------------------------------------------------------
//--                           Behaviour Management                           --
//------------------------------------------------------------------------------

  type RSC_BehaviourInfo = {
    Name:RSC_Name,
    AttributeSet:{[normalizedName:RSC_Name]:RSC_Name},
    Source?:Text,
    Executable?:Function,
    Error?:RSC_ErrorInfo
  }

  type RSC_BehaviourRegistry = {
    [normalizedName:RSC_Name]:RSC_BehaviourInfo
  }

/**** Behaviours are global ****/

  const BehaviourRegistry:RSC_BehaviourRegistry = Object.create(null)

/**** InfoForBehaviour ****/

  function InfoForBehaviour (Name:RSC_Name):RSC_BehaviourInfo|undefined {
    return BehaviourRegistry[Name.toLowerCase()]
  }

/**** registerBehaviour ****/

  export function registerBehaviour (
    Name:RSC_Name, SourceOrExecutable:Text|Function,
    observedAttributes:RSC_Name[] = []
  ):void {
    expectName('behaviour name',Name)

    if (! ValueIsFunction(SourceOrExecutable)) {
      expectText('behaviour script',SourceOrExecutable)
    }

    allowListSatisfying(
      'list of observed element attributes', observedAttributes, ValueIsName
    )

    let normalizedName = Name.toLowerCase()

    const AttributeSet = Object.create(null)
    if (observedAttributes != null) {
      observedAttributes.forEach(
        (internalName) => AttributeSet[normalizedAttributeName(internalName)] = internalName
      )
      observedAttributes = observedAttributes.map((Name) => Name.toLowerCase())
    }

    if (ValueIsFunction(SourceOrExecutable)) {
      BehaviourRegistry[normalizedName] = {
        Name, AttributeSet, Executable:SourceOrExecutable as Function
      }
    } else {
      if (normalizedName in BehaviourRegistry) {
        const BehaviourInfo = BehaviourRegistry[normalizedName]
        if (BehaviourInfo.Source == null) throwError(
          'ForbiddenOperation: cannot overwrite intrinsic behaviour ' + quoted(Name)
        )

        if (BehaviourInfo.Source.trim() !== (SourceOrExecutable as Text).trim()) throwError(
          'ForbiddenOperation: cannot overwrite existing behaviour ' + quoted(Name)
        )
      } else {
        let Source = SourceOrExecutable as Text

        let Executable:Function
        try {
          Executable = compiledScript(Source)
        } catch (Signal) {
          console.error(
            `CompilationError: compilation of behaviour ${quoted(Name)} failed. ` +
            'Reason: ' + Signal
          )

          BehaviourRegistry[normalizedName] = {
            Name, AttributeSet, Source, Error:{
              Title:'Compilation Failure',
              Message:`Compilation of behaviour ${quoted(Name)} failed.\n\n` +
                'Reason:' + Signal
            }
          }
          return
        }

        BehaviourRegistry[normalizedName] = {
          Name, AttributeSet, Source, Executable
        }
      }
    }

  /**** install a custom element for the given behaviour ****/

    const customizedVisual = class extends RSC_Visual {
      static observedAttributes:string[] = observedAttributes
    }
    customElements.define('rsc-' + normalizedName, customizedVisual)
  }

  BehaviourRegistry['visual'] = {
    Name:'Visual', AttributeSet:{ value:'Value' }
  }

/**** registerBehaviourFromElement ****/

  function registerBehaviourFromElement (ScriptElement:Element):void {
    let Name = expectedName(
      'behaviour name',ScriptElement.getAttribute('for-behaviour')
    )
    if (Name.toLowerCase() === 'visual') throwError(
      'ReservedName: behaviour name "visual" is reserved for internal use'
    )

    let Source = ScriptElement.innerHTML

    let observedAttributes:RSC_Name[] = (
      (ScriptElement.getAttribute('observed-attributes') || '')
      .split(/\s*(?:,|$)\s*/).filter((Name) => (Name || '').trim() !== '')
    )
    if (! ValueIsListSatisfying(observedAttributes,ValueIsName)) throwError(
      'Invalidargument: attribute "observed-attributes" does not contain a ' +
      'list of valid RSC attribute names'
    )

    registerBehaviour(Name,Source,observedAttributes)

    permitVisualsWithinBehaviour(
      Name, ScriptElement.getAttribute('permitted-contents') || ''
    )

    forbidVisualsWithinBehaviour(
      Name, ScriptElement.getAttribute('forbidden-contents') || ''
    )
  }

/**** registerAllBehavioursFoundInHead ****/

  function registerAllBehavioursFoundInHead ():void {
    innerElementsOf(document.head).forEach((Element) => {
      if (Element.matches('script[type="rsc-script"][for-behaviour]')) {
        registerBehaviourFromElement(Element)
      }
    })
  }

/**** registerAllBehavioursFoundInVisual ****/

  function registerAllBehavioursFoundInVisual (Visual:RSC_Visual):void {
    innerElementsOf(Visual).forEach((Element) => {
      if (Element.matches('script[type="rsc-script"][for-behaviour]')) {
        registerBehaviourFromElement(Element)
      }
    })
  }

/**** normalizedAttributeName ****/

  function normalizedAttributeName (originalName:string):string {
    return (
      originalName[0].toLowerCase() +
      originalName.slice(1).replace(/[A-Z]+/g,function (Match) {
        return (
          Match.length === 1
          ? '-' + Match.toLowerCase()
          : Match.slice(0,-1).toLowerCase() + '-' + Match.slice(-1).toLowerCase()
        )
      })
    )
  }

//registerAllBehavioursFoundInHead()           // not yet, only after RSC_Visual

/**** BehaviourNameOfVisual ****/

  function BehaviourNameOfVisual (Visual:RSC_Visual):RSC_Name|undefined {
    let BehaviourName = Visual.tagName.slice(4).toLowerCase()
    if (BehaviourName === 'visual') {
      BehaviourName = Visual.getAttribute('behaviour') as string
      return (ValueIsName(BehaviourName) ? BehaviourName : 'visual')
    } else {
      return InfoForBehaviour(BehaviourName)?.Name || BehaviourName
    }
  }

//------------------------------------------------------------------------------
//--                    Content and Containment Validation                    --
//------------------------------------------------------------------------------

  type RSC_SelectorSet = {[BehaviourName:RSC_Name]:string}

  const permittedVisualsSelectorWithinBehaviour:RSC_SelectorSet = Object.create(null)
  const forbiddenVisualsSelectorWithinBehaviour:RSC_SelectorSet = Object.create(null)

/**** permitVisualsWithinBehaviour ****/

  function permitVisualsWithinBehaviour (
    BehaviourName:RSC_Name, Selector:string
  ):void {
    Selector = Selector.trim()
    if (Selector !== '') {
      const normalizedBehaviourName = BehaviourName.toLowerCase()
      permittedVisualsSelectorWithinBehaviour[normalizedBehaviourName] = Selector
    }
  }

/**** forbidVisualsWithinBehaviour ****/

  function forbidVisualsWithinBehaviour (
    BehaviourName:RSC_Name, Selector:string
  ):void {
    Selector = Selector.trim()
    if (Selector !== '') {
      const normalizedBehaviourName = BehaviourName.toLowerCase()
      forbiddenVisualsSelectorWithinBehaviour[normalizedBehaviourName] = Selector
    }
  }

/**** validateContentsOfVisual ****/

  function validateContentsOfVisual (Visual:RSC_Visual):void {
    const BehaviourName = BehaviourNameOfVisual(Visual)
    if (BehaviourName == null) { return }

    const normalizedBehaviourName = BehaviourName.toLowerCase()
    let permittedVisualsSelector = permittedVisualsSelectorWithinBehaviour[normalizedBehaviourName]
    let forbiddenVisualsSelector = forbiddenVisualsSelectorWithinBehaviour[normalizedBehaviourName]

    if ((permittedVisualsSelector != null) || (forbiddenVisualsSelector != null)) {
      innerVisualsOf(Visual).forEach((innerVisual) => {
        if ((
          (permittedVisualsSelector != null) &&
          ! innerVisual.matches(permittedVisualsSelector)
        ) || (
          (forbiddenVisualsSelector != null) &&
          innerVisual.matches(forbiddenVisualsSelector)
        )) {
          innerVisual.remove()
        }
      })
    }
  }

/**** validateContainerOfVisual ****/

  function validateContainerOfVisual (Visual:RSC_Visual):void {
    const Container = outerVisualOf(Visual)
    if (Container == null) { return }

    const BehaviourName = BehaviourNameOfVisual(Container)
    if (BehaviourName == null) { return }

    const normalizedBehaviourName = BehaviourName.toLowerCase()

    let permittedVisualsSelector = permittedVisualsSelectorWithinBehaviour[normalizedBehaviourName]
    if (permittedVisualsSelector != null) {
      if (! Visual.matches(permittedVisualsSelector)) throwError(
        'InacceptableInnerVisual: the given visual is not allowed to become a ' +
        'part of its container'
      )
    }

    let forbiddenVisualsSelector = forbiddenVisualsSelectorWithinBehaviour[normalizedBehaviourName]
    if (forbiddenVisualsSelector != null) {
      if (Visual.matches(forbiddenVisualsSelector)) throwError(
        'InacceptableInnerVisual: the given visual is not allowed to become a ' +
        'part of its container'
      )
    }
  }

//------------------------------------------------------------------------------
//--                       Script Delegation Management                       --
//------------------------------------------------------------------------------

  type RSC_Selector = Textline

  type RSC_ScriptDelegationInfo = {
    Selector:RSC_Selector,
    Source:Text,
    Executable:Function,
    Error?:RSC_ErrorInfo
  }

  type RSC_ScriptDelegationSet = {[Selector:RSC_Selector]:RSC_ScriptDelegationInfo}

  const ScriptDelegationSetForVisual:WeakMap<RSC_Visual,RSC_ScriptDelegationSet> = new WeakMap()

/**** registerDelegatedScriptInVisual ****/

  function registerDelegatedScriptInVisual (
    Visual:RSC_Visual, Selector:RSC_Selector, Source:Text
  ):void {
    let ScriptDelegationSet = ScriptDelegationSetForVisual.get(Visual)
    if (ScriptDelegationSet == null) {
      ScriptDelegationSetForVisual.set(Visual,ScriptDelegationSet = Object.create(null))
    }

    if (Selector in (ScriptDelegationSet as RSC_ScriptDelegationSet)) throwError(
      'ForbiddenOperation: a script for elements matching selector ' +
      quoted(Selector) + ' exists already'
    )

    let Executable:Function
    try {
      Executable = compiledScript(Source)
    } catch (Signal) {
      throwError(
        'CompilationError: compilation of delegated script for elements ' +
        'matching selector ' + quoted(Selector) + ' failed. ' +
        'Reason: ' + Signal
      )
    }

    (ScriptDelegationSet as RSC_ScriptDelegationSet)[Selector] = { Selector, Source, Executable }
  }

/**** registerDelegatedScriptFromElement ****/

  function registerDelegatedScriptFromElement (
    Visual:RSC_Visual, ScriptElement:Element
  ):void {
    let Selector = expectedTextline(
      'element selector',ScriptElement.getAttribute('for')
    )

    let Script = ScriptElement.innerHTML

    registerDelegatedScriptInVisual(Visual, Selector, Script)
  }

/**** registerAllDelegatedScriptsFoundInVisual ****/

  function registerAllDelegatedScriptsFoundInVisual (Visual:RSC_Visual):void {
    innerElementsOf(Visual).forEach((Element) => {
      if (Element.matches('script[type="rsc-script"][for]')) {
        registerDelegatedScriptFromElement(Visual,Element)
      }
    })
  }

/**** delegatedScriptInfoForVisual ****/

  function delegatedScriptInfoForVisual (
    Visual:RSC_Visual
  ):RSC_ScriptDelegationInfo|undefined {
    let ScriptContainer = Visual
    while (ScriptContainer != null) {
      let ScriptDelegationSet = ScriptDelegationSetForVisual.get(ScriptContainer)
      if (ScriptDelegationSet != null) {
        for (const Selector in ScriptDelegationSet) {
          if (Visual.matches(Selector)) {
            return ScriptDelegationSet[Selector]
          }
        }
      }

      ScriptContainer = outerVisualOf(ScriptContainer) as RSC_Visual
    }
  }

//------------------------------------------------------------------------------
//--                             Script Handling                              --
//------------------------------------------------------------------------------

/**** ScriptOfVisual ****/

  function ScriptOfVisual (Visual:RSC_Visual):Text|undefined {
    let Script = Visual.getAttribute('script') || ''
    return (Script.trim() === '' ? undefined : Script)
  }

/**** ScriptInVisual ****/

  function ScriptInVisual (Visual:RSC_Visual):Text|undefined {
    const ScriptList = innerElementsOf(Visual)
    for (let i = 0, l = ScriptList.length; i < l; i++) {
      let Candidate = ScriptList[i]
      if (
        (Candidate.tagName === 'SCRIPT') &&
        ((Candidate.getAttribute('type') || '') === 'rsc-script') &&
        ! Candidate.hasAttribute('for') && ! Candidate.hasAttribute('for-behaviour')
      ) { return Candidate.innerHTML }
    }
  }

/**** compiledScript - throws on failure ****/

  function compiledScript (Script:Text):Function {
    return new Function(
      'my,me, RSC,JIL, onAttributeChange, onAttachment,onDetachment, ' +
      'toRender, html, on,once,off,trigger, reactively',
      Script || ''
    )                                                                // may fail!
  }

/**** applyExecutable - throws on failure ****/

  function applyExecutable (Visual:RSC_Visual, Executable:Function):void {
    const onAttributeChange = Visual.onAttributeChange.bind(Visual)
    const onAttachment      = Visual.onAttachment     .bind(Visual)
    const onDetachment      = Visual.onDetachment     .bind(Visual)
    const toRender          = Visual.toRender         .bind(Visual)

  /**** on ****/

    function on (
      Events:string, SelectorOrHandler:string|String|null|Function,
      DataOrHandler?:any, Handler?:Function
    ):void {
      registerEventHandlerForVisual(
        Visual, Events,SelectorOrHandler,DataOrHandler,Handler
      )
    }

  /**** once ****/

    function once (
      Events:string, SelectorOrHandler:string|String|null|Function,
      DataOrHandler?:any, Handler?:Function
    ):void {
      registerEventHandlerForVisual(
        Visual, Events,SelectorOrHandler,DataOrHandler,Handler, 'once'
      )
    }

  /**** off ****/

    function off (
      Events?:string, SelectorOrHandler?:string|String|null|Function,
      Handler?:Function
    ):void {
      let ArgList = Array.prototype.slice.call(arguments,1)

      Events = (Events || '').trim().replace(/\s+/g,' ')
      if (Events === '') {
        unregisterAllMatchingEventHandlersFromVisual(Visual)
        return
      }

      let Selector:string = (
        ValueIsString(ArgList[0])
        ? (ArgList.shift() as string).trim()
        : (ArgList[0] === null ? ArgList.shift() || '' : undefined)
      )          // "null" means: no selector, "undefined" means: any selector

      Handler = ArgList.shift()
      if (Handler == null) {
        unregisterAllMatchingEventHandlersFromVisual(Visual,Events,Selector)
      } else {
        unregisterAllMatchingEventHandlersFromVisual(Visual,Events,Selector,Handler)
      }
    }

  /**** trigger ****/

    function trigger (
      EventToTrigger:string|Event, Arguments:any[],
      bubbles = true
    ):boolean {
      Arguments = (ValueIsArray(Arguments) ? Arguments.slice() : [])

      switch (true) {
        case ValueIsString(EventToTrigger):
          EventToTrigger = new CustomEvent(
            EventToTrigger as string, {
              bubbles, cancelable:true, detail:{ Arguments }
            }
          )
          break
        case (EventToTrigger instanceof Event):
          EventToTrigger = new CustomEvent((EventToTrigger as Event).type,
            Object.assign({}, EventToTrigger, {
              bubbles, cancelable:true , detail:{ Arguments }
            })
          )
          break
        default: debugger; throwError(
          'InvalidArgument: Event instance or literal event type expected'
        )
      }

      Visual.dispatchEvent(EventToTrigger as CustomEvent)

      const EventDetails = (EventToTrigger as CustomEvent).detail
      if (EventDetails?.Error == null) {
        return EventDetails?.Result
      } else {
        throw EventDetails?.Error
      }
    }

  /**** reactively ****/

    function reactively (reactiveFunction:Function) {
      expectFunction('reactive function',reactiveFunction)
// @ts-ignore we definitely want the function argument to be accepted
      registerReactiveFunctionIn(Visual,computed(reactiveFunction))
    }

  /**** run "Executable" in the context of "Visual" ****/

    Executable.apply(Visual, [
      Visual,Visual, RSC,JIL, onAttributeChange, onAttachment,onDetachment,
      toRender, html, on,once,off,trigger, reactively
    ])
  }

/**** applyBehaviourScriptOfVisual ****/

  function applyBehaviourScriptOfVisual (Visual:RSC_Visual):void {
    const BehaviourName = BehaviourNameOfVisual(Visual)
    if (BehaviourName == null) { return }

    const BehaviourInfo = InfoForBehaviour(BehaviourName)
    if (BehaviourInfo == null) {
      setErrorOfVisual(Visual,{
        Title:'Missing Behaviour',
        Message:'Behaviour ' + quoted(BehaviourName) + ' could not be found'
      })
      return
    }

    if (BehaviourInfo.Error != null) {
      setErrorOfVisual(Visual,BehaviourInfo.Error)
      return
    }

    const Executable = BehaviourInfo.Executable as Function
    if (Executable == null) { return }

    try {
      applyExecutable(Visual,Executable)
    } catch (Signal) {
console.error('behaviour script execution failure',Signal)
      setErrorOfVisual(Visual,{
        Title:'Execution Failure',
        Message:'Script of behaviour ' + quoted(BehaviourName) + ' could not ' +
                'be executed.\n\nReason:\n' + Signal
      })
      return
    }
  }

/**** applyElementScriptOfVisual ****/

  function applyElementScriptOfVisual (Visual:RSC_Visual):void {
    const Script = ScriptOfVisual(Visual) || ScriptInVisual(Visual)
    if (Script != null) {
      let Executable
      try {
        Executable = compiledScript(Script)
      } catch (Signal) {
console.error('element script compilation failure',Signal)
        setErrorOfVisual(Visual,{
          Title:'Compilation Failure',
          Message:'Visual script could not be compiled.\n\nReason:\n' + Signal
        })
      }

      try {
        applyExecutable(Visual,Executable as Function)
      } catch (Signal) {
console.error('element script execution failure',Signal)
        setErrorOfVisual(Visual,{
          Title:'Execution Failure',
          Message:'Visual script could not be executed.\n\nReason:\n' + Signal
        })
      }
      return
    }

    const ScriptDelegationInfo = delegatedScriptInfoForVisual(Visual)
    if (ScriptDelegationInfo != null) {
      if (ScriptDelegationInfo.Error != null) {
console.error('element script compilation failure',ScriptDelegationInfo.Error)
        setErrorOfVisual(Visual,ScriptDelegationInfo.Error)
        return
      }

      try {
        applyExecutable(Visual,ScriptDelegationInfo.Executable)
      } catch (Signal) {
console.error('element script execution failure',Signal)
        setErrorOfVisual(Visual,{
          Title:'Execution Failure',
          Message:'delegated visual script with selector ' +
            quoted(ScriptDelegationInfo.Selector) + ' could not be ' +
            'executed.\n\nReason:\n' + Signal
        })
        return
      }
    }
  }

//------------------------------------------------------------------------------
//--                              Event Handling                              --
//------------------------------------------------------------------------------

/**** ValueIsEventNameWithSelector ****/

  const RSC_NameWithSelectorPattern = /^[a-z$_][a-z$_0-9]*([-.:][a-z$_0-9]+)*@.*$/i

  function ValueIsEventNameWithSelector (Value:any):boolean {
    return ValueIsStringMatching(Value,RSC_NameWithSelectorPattern)
  }

/**** registerEventHandlerForVisual ****/

  function registerEventHandlerForVisual (
    Visual:RSC_Visual,
    Events:string, SelectorOrHandler?:string|String|null|Function,
    DataOrHandler?:any, Handler?:Function, once?:'once'
  ):void {
    let ArgList = Array.prototype.slice.call(arguments,1)

    Events = ArgList.shift().trim().replace(/\s+/g,' ')
    if (Events === '') { return }

    let Selector:string = (
      ValueIsString(ArgList[0])
      ? (ArgList.shift() as string).trim()
      : (ArgList[0] == null ? ArgList.shift() || '' : '')
    )                                                   // '' means: no selector

    let Data:any = (
      typeof ArgList[1] === 'function'
      ? ArgList.shift()
      : undefined
    )

    Handler = ArgList.shift() as Function

    _registerEventHandlerForVisual(
      Visual, Events,Selector,Data,Handler, once
    )
  }

/**** _registerEventHandlerForVisual ****/

  const EventRegistryForVisual:WeakMap<RSC_Visual,object> = new WeakMap()

  function _registerEventHandlerForVisual (
    Visual:RSC_Visual,
    Events:string, Selector:string|String, Data:any,
    Handler:Function, once?:'once'
  ):void {
  /**** actualHandler ****/

    function actualHandler (Event:indexableEvent):void {
      switch (Selector) {
        case '':
          break
        case '@this':
          if (Event.target !== Event.currentTarget) { return }
          break
        default:
          if (! (Event.target as Element).matches(Selector as string)) { return }
      }

      if (Data != null) { Event.data = Data }

      if (once) {
        unregisterAllMatchingEventHandlersFromVisual(
          Visual, Event.type,Selector,Handler
        )
      }

      let ArgList = [Event].concat(Event.detail?.Arguments || [])
      try {
        const Result = Handler.apply(Visual,ArgList)
        if (Result !== undefined) {
          ;(Event.detail || {}).Result = Result

          Event.stopImmediatePropagation()
          Event.preventDefault()
        }
      } catch (Signal) {
        ;(Event.detail || {}).Error = Signal

        Event.stopImmediatePropagation()
        Event.preventDefault()
      }
    }
    (actualHandler as indexableFunction)['isFor'] = Handler

    let EventList:string[]
    if (ValueIsEventNameWithSelector(Events)) {
      let AtIndex = Events.indexOf('@')
      EventList = [Events.slice(0,AtIndex)]
      Selector  = Events.slice(AtIndex+1)
        if (Selector === 'this') { Selector = '@this' }          // special case
    } else {
      EventList = Events.split(' ')
    }

    let EventRegistry:Indexable = EventRegistryForVisual.get(Visual) as Indexable
    if (EventRegistry == null) {
      EventRegistryForVisual.set(Visual,EventRegistry = Object.create(null))
    }

    EventList.forEach((Event) => {
      let EntriesForEvent:Indexable = (EventRegistry as Indexable)[Event]
      if (EntriesForEvent == null) {
        EntriesForEvent = (EventRegistry as Indexable)[Event] = Object.create(null)
      }

      let EntriesForSelector:Function[] = EntriesForEvent[Selector as string]
      if (EntriesForSelector == null) {
        EntriesForSelector = EntriesForEvent[Selector as string] = []
      }

      EntriesForSelector.push(actualHandler)
      Visual.addEventListener(Event,actualHandler)
    })
  }

/**** unregisterAllMatchingEventHandlersFromVisual ****/

  function unregisterAllMatchingEventHandlersFromVisual (
    Visual:RSC_Visual,
    Events?:string, Selector?:string|String|null, Handler?:Function
  ):void {
    let EventList:string[]
    if (ValueIsEventNameWithSelector(Events)) {
      let AtIndex = (Events as string).indexOf('@')
      EventList = [(Events as string).slice(0,AtIndex)]
      Selector  = (Events as string).slice(AtIndex+1)
    } else {
      EventList = (Events == null ? [] : Events.split(' '))
    }

    const EventRegistry = EventRegistryForVisual.get(Visual)
    if (EventRegistry == null) { return }

    if (EventList.length === 0) {               // unregister any event handlers
      for (let Event in EventRegistry) {
        unregisterMatchingEventHandlersFromVisual(
          Visual, Event,Selector,Handler
        )
      }
    } else {                    // unregister handlers for the given events only
      EventList.forEach((Event:string) => {
        unregisterMatchingEventHandlersFromVisual(
          Visual, Event,Selector,Handler
        )
      })
    }
  }

/**** unregisterMatchingEventHandlersFromVisual ****/

  function unregisterMatchingEventHandlersFromVisual (
    Visual:RSC_Visual,
    Event:string, Selector?:string|String|null, Handler?:Function
  ):void {
    const EventRegistry:Indexable = EventRegistryForVisual.get(Visual) as Indexable
    if (EventRegistry == null) { return }

    let EntriesForEvent:Indexable = EventRegistry[Event]
    if (EntriesForEvent != null) {
      if (Selector == null) {
        for (let Selector in EntriesForEvent) {
          unregisterMatchingEventSelectorHandlersFromVisual(
            Visual, EntriesForEvent, Event,Selector,Handler
          )
        }
      } else {
        unregisterMatchingEventSelectorHandlersFromVisual(
          Visual, EntriesForEvent, Event,Selector,Handler
        )
      }

      if (ObjectIsEmpty(EntriesForEvent)) {
        delete EventRegistry[Event]
      }
    }
  }

/**** unregisterMatchingEventSelectorHandlersFromVisual ****/

  function unregisterMatchingEventSelectorHandlersFromVisual (
    Visual:RSC_Visual,
    EntriesForEvent:any, Event:string, Selector:string|String, Handler?:Function
  ):void {
    let EntriesForSelector:Function[] = EntriesForEvent[Selector as string]
    if (EntriesForSelector != null) {
      if (Handler == null) {
        EntriesForSelector.forEach((actualHandler:Function) => {
// @ts-ignore TypeScript does not allow JS functions here, but that's wrong
          Visual.removeEventListener(Event,actualHandler)
        })
        EntriesForSelector.length = 0
      } else {
        EntriesForSelector.every((actualHandler:indexableFunction, Index:number) => {
          if (actualHandler['isFor'] === Handler) {
// @ts-ignore TypeScript does not allow JS functions here, but that's wrong
            Visual.removeEventListener(Event,actualHandler)
            EntriesForSelector.splice(Index,1)
            return false
          }
          return true
        })
      }

      if (EntriesForSelector.length === 0) {
        delete EntriesForEvent[Selector as string]
      }
    }
  }

//------------------------------------------------------------------------------
//--                           Reactivity Handling                            --
//------------------------------------------------------------------------------

  const reactiveFunctionsForVisual:WeakMap<RSC_Visual,Function[]>  = new WeakMap()
  const reactiveAttributesForVisual:WeakMap<RSC_Visual,Function[]> = new WeakMap()

/**** ObservablesOfVisual ****/

  const ObservablesForVisual:WeakMap<RSC_Visual,Indexable> = new WeakMap()

  function ObservablesOfVisual (Visual:RSC_Visual):Indexable {
    let Observables = ObservablesForVisual.get(Visual)
    if (Observables == null) {
      ObservablesForVisual.set(Visual, Observables = observe({},{ deep:false }))
    }
    return Observables as Indexable
  }

/**** InternalsOfVisual ****/

  const InternalsForVisual:WeakMap<RSC_Visual,Indexable> = new WeakMap()

  function InternalsOfVisual (Visual:RSC_Visual):Indexable {
    let Internals = InternalsForVisual.get(Visual)
    if (Internals == null) {
      InternalsForVisual.set(Visual, Internals = {})
    }
    return Internals as Indexable
  }

/**** startReactiveRenderingOfVisual ****/

  const reactiveRendererForVisual:WeakMap<RSC_Visual,Function> = new WeakMap()

  function startReactiveRenderingOfVisual (Visual:RSC_Visual):void {
    reactiveRendererForVisual.set(Visual,computed(Visual.render.bind(Visual)))
  }

/**** stopReactiveRenderingOfVisual ****/

  function stopReactiveRenderingOfVisual (Visual:RSC_Visual):void {
    const Renderer = reactiveRendererForVisual.get(Visual)
    if (Renderer != null) {
      dispose(Renderer)
      reactiveRendererForVisual.delete(Visual)
    }
  }

/**** ValueIsReactiveAttributeName ****/

  function ValueIsReactiveAttributeName (Value:any):boolean {
    return (
      ValueIsString(Value) && (
        Value.startsWith('$')  && ValueIsName(Value.slice(1)) ||
        Value.startsWith('$$') && ValueIsName(Value.slice(2))
      )
    )
  }

/**** updateAttributeOfVisual (non-reactive attributes only) ****/

  function updateAttributeOfVisual (
    Visual:RSC_Visual, normalizedName:RSC_Name, newValue:string|undefined
  ):void {
    let AttributeChangeHandler = AttributeChangeHandlerForVisual.get(Visual)
    if (AttributeChangeHandler != null) {
      try {
        const AttributeWasProcessed = AttributeChangeHandler.call(
          Visual, normalizedName, newValue
        )
        if (AttributeWasProcessed == true) { return }
      } catch (Signal) {
console.error('attribute change handler failure',Signal)
        setErrorOfVisual(Visual,{
          Title:'Attribute Change Handler Failure',
          Message:'Running the configured attribute change handler failed\n\n' +
                  'Reason: ' + Signal
        })
        return
      }
    }

  /**** perform automatic attribute mapping ****/

    const BehaviourName = BehaviourNameOfVisual(Visual)
    if (BehaviourName == null) { return }

    const Behaviour = InfoForBehaviour(BehaviourName)
    if (Behaviour == null) { return }

    const AttributeSet = Behaviour.AttributeSet
    if (normalizedName in AttributeSet) {
      const originalName = AttributeSet[normalizedName]
      try {
        Visual.observed[originalName] = newValue
      } catch (Signal) {
console.error('attribute change failure',Signal)
        setErrorOfVisual(Visual,{
          Title:'Attribute Change Failure',
          Message:(
            'could not update observed property "' +
            quoted(originalName) + '" upon a change of attribute "' +
            quoted(normalizedName) + '"'
          )
        })
      }
    }
  }

/**** updateAllAttributesOfVisual (non-reactive attributes only) ****/

  function updateAllAttributesOfVisual (Visual:RSC_Visual):void {
    Array.from(Visual.attributes).forEach((Attribute) => {
      const normalizedName = Attribute.name
      if (ValueIsName(normalizedName)) {      // ignores all reactive attributes
        updateAttributeOfVisual(Visual,normalizedName,Attribute.value)
      }
    })
  }

/**** registerAllReactiveAttributesOfVisual ****/

  function registerAllReactiveAttributesOfVisual (Visual:RSC_Visual):void {
    Array.from(Visual.attributes).forEach((Attribute) => {
      const reactiveName = Attribute.name
      if (ValueIsReactiveAttributeName(reactiveName)) {
        const BehaviourName = BehaviourNameOfVisual(Visual)
        if (BehaviourName == null) { return }

        const Behaviour = InfoForBehaviour(BehaviourName)
        if (Behaviour == null) { return }

        const normalizedName = reactiveName.replace(/^[$]{1,2}/,'')

        const AttributeSet = Behaviour.AttributeSet
        if (normalizedName in AttributeSet) {
          const originalName = AttributeSet[normalizedName]

          const { Base,PathList } = parsedAccessPathFromVisual(
            Visual, Attribute.value
          )

          let HandlerList:Function[] = reactiveAttributesForVisual.get(Visual) as Function[]
          if (HandlerList == null) {
            reactiveAttributesForVisual.set(Visual,HandlerList = [])
          }

          const Handler = computed(() => {
            Visual.observed[originalName] = ValueOfReactiveVariable(Base, PathList)
          })
          HandlerList.push(Handler)

          if (reactiveName.startsWith('$$')) {
            const Handler = computed(() => {
              setValueOfReactiveVariable(
                Base, PathList, Visual.observed[originalName]
              )
            })
            HandlerList.push(Handler)
          }
        }
      }
    })
  }

/**** parsedAccessPathFromVisual ****/

  type RSC_AccessPath = {
    Base:RSC_Visual,
    PathList:string[]
  }

  const    dottedIndexPattern = /^\s*[.]([^.\[]+)/
  const  unquotedIndexPattern = /^\s*\[([^'"\]]+)\]/
  const sglquotedIndexPattern = /^\s*\[\s*'(([^'\\]|\\(["'\\\/bfnrt]|x[0-9a-f]{2}|u[0-9a-f]{4}))*)'\s*\]/i
  const dblquotedIndexPattern = /^\s*\[\s*"(([^"\\]|\\(["'\\\/bfnrt]|x[0-9a-f]{2}|u[0-9a-f]{4}))*)"\s*\]/i

  function parsedAccessPathFromVisual (
    Visual:RSC_Visual, literalPath:string
  ):RSC_AccessPath {
    const SplitIndex = literalPath.indexOf(':observed')
    if (SplitIndex < 0) throwError(
      'InvalidAccessPath:invalid access path ' + quoted(literalPath)
    )

    let Selector = literalPath.slice(0,SplitIndex)
    if (ValueIsName(Selector)) {
      const normalizedName = Selector.toLowerCase()
      Selector = `rsc-${normalizedName},[behaviour="${normalizedName}"]`
    }

    let Base = closestVisualMatching(Visual,Selector)
    if (Base == null) throwError(
      'NoSuchVisual:could not find a close visual matching CSS selector' +
      quoted(Selector)
    )

    let AccessPath = literalPath.slice(SplitIndex + 9).trim()

    const PathList:string[] = []; let Match
    while (AccessPath !== '') {
      switch (true) {
        case (Match =   dottedIndexPattern.exec(AccessPath)) != null:
        case (Match = unquotedIndexPattern.exec(AccessPath)) != null:
// @ts-ignore 18048: we know that Match is not null
          PathList.push(Match[1].trim())
// @ts-ignore 18048: we know that Match is not null
          AccessPath = AccessPath.slice(Match[0].length).trim()
          break
        case (Match = sglquotedIndexPattern.exec(AccessPath)) != null:
        case (Match = dblquotedIndexPattern.exec(AccessPath)) != null:
// @ts-ignore 18048: we know that Match is not null
          PathList.push(Match[1])
// @ts-ignore 18048: we know that Match is not null
          AccessPath = AccessPath.slice(Match[0].length).trim()
          break
        default:
          throwError('InvalidAccessPath:invalid access path ' + quoted(literalPath))
      }
    }

    return { Base,PathList }
  }

/**** ValueOfReactiveVariable ****/

  function ValueOfReactiveVariable (Base:RSC_Visual, PathList:string[]):any {
    let Value:any = Base.observed[PathList[0]]
      for (let i = 1, l = PathList.length; i < l; i++) {
        if (Value == null) throwError(
          'InvalidAccess:cannot access variable bound to reactive attribute'
        )
        Value = Value[PathList[i]]
      }
    return Value
  }

/**** setValueOfReactiveVariable ****/

  function setValueOfReactiveVariable (
    Base:RSC_Visual, PathList:string[], Value:any
  ):void {
    let Variable:Indexable = Base.observed
      for (let i = 0, l = PathList.length-1; i < l; i++) {
        if (Variable == null) throwError(
          'InvalidAccess:cannot access variable bound to reactive attribute'
        )
        Variable = Variable[PathList[i]]
      }

    Variable[PathList[PathList.length-1]] = Value

    if (PathList.length > 1) {// explicitly trigger change of outermost variable
      const observed = Base.observed
      if (Array.isArray(PathList[0])) {
        observed[PathList[0]] = [...observed[PathList[0]]]
      } else {
        observed[PathList[0]] = {...observed[PathList[0]]}
      }
    }
  }

/**** unregisterAllReactiveAttributesOfVisual ****/

  function unregisterAllReactiveAttributesOfVisual (Visual:RSC_Visual):void {
    let HandlerList:Function[] = reactiveAttributesForVisual.get(Visual) as Function[]
    if (HandlerList == null) { return }

    HandlerList.forEach((Handler) => {
      dispose(Handler)
    })
  }

/**** registerReactiveFunctionIn ****/

  function registerReactiveFunctionIn (
    Visual:RSC_Visual, reactiveFunction:Function
  ):void {
    let reactiveFunctions = reactiveFunctionsForVisual.get(Visual)
    if (reactiveFunctions == null) {
      reactiveFunctionsForVisual.set(Visual,reactiveFunctions = [])
    }
    reactiveFunctions.push(reactiveFunction)
  }

/**** unregisterAllReactiveFunctionsFrom ****/

  function unregisterAllReactiveFunctionsFrom (Visual:RSC_Visual):void {
    let reactiveFunctions = reactiveFunctionsForVisual.get(Visual)
    if (reactiveFunctions == null) { return }

    reactiveFunctions.forEach((reactiveFunction) => {
      dispose(reactiveFunction)
    })
  }

//------------------------------------------------------------------------------
//--                              Error Handling                              --
//------------------------------------------------------------------------------

  type RSC_ErrorInfo = {
    Title:Textline,
    Message:Text
  }

  const ErrorInfoForVisual:WeakMap<RSC_Visual,RSC_ErrorInfo> = new WeakMap()

/**** setErrorOfVisual ****/

  function setErrorOfVisual (
    Visual:RSC_Visual, ErrorInfo:RSC_ErrorInfo|undefined
  ):void {
    expectErrorInfo('RSC error info record',ErrorInfo)

    if (ErrorInfoForVisual.get(Visual) == null) {
      ErrorInfoForVisual.set(Visual,ErrorInfo as RSC_ErrorInfo)
      Visual.render()
    }
  }

/**** ErrorOfVisual ****/

  function ErrorOfVisual (Visual:RSC_Visual):RSC_ErrorInfo|undefined {
    return ErrorInfoForVisual.get(Visual)
  }

/**** RSC_ErrorIndicator ****/

  function RSC_ErrorIndicator (PropSet:Indexable) {
    const Visual = PropSet.visual

    function onClick (Event:Event) {
      showErrorInfoForVisual(Visual)
    }

    return html`
      <style>
        .RSC-ErrorIndicator {
          display:block; position:absolute; overflow:hidden;
          left:0px; top:0px; width:24px; height:24px;
          background:url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg width='24px' height='24px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 17.0001H12.01M12 10.0001V14.0001M6.41209 21.0001H17.588C19.3696 21.0001 20.2604 21.0001 20.783 20.6254C21.2389 20.2985 21.5365 19.7951 21.6033 19.238C21.6798 18.5996 21.2505 17.819 20.3918 16.2579L14.8039 6.09805C13.8897 4.4359 13.4326 3.60482 12.8286 3.32987C12.3022 3.09024 11.6978 3.09024 11.1714 3.32987C10.5674 3.60482 10.1103 4.4359 9.19614 6.09805L3.6082 16.2579C2.74959 17.819 2.32028 18.5996 2.39677 19.238C2.46351 19.7951 2.76116 20.2985 3.21709 20.6254C3.7396 21.0001 4.63043 21.0001 6.41209 21.0001Z' stroke='orange' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='white'/%3E%3C/svg%3E");
          pointer-events:auto;
        }
      </style>
      <div class="RSC-ErrorIndicator" onClick=${onClick}></div>
    `
  }

/**** showErrorInfoForVisual ****/

  function showErrorInfoForVisual (Visual:RSC_Visual):void {
    const { Title,Message } = ErrorOfVisual(Visual) as RSC_ErrorInfo
    window.alert(Title + '\n\n' + Message)
  }

//------------------------------------------------------------------------------
//--                                RSC_Visual                                --
//------------------------------------------------------------------------------

  const ShadowRootForVisual:WeakMap<RSC_Visual,any> = new WeakMap()

  const AttributeChangeHandlerForVisual:WeakMap<RSC_Visual,Function> = new WeakMap()
  const AttachmentHandlerForVisual:WeakMap<RSC_Visual,Function>      = new WeakMap()
  const DetachmentHandlerForVisual:WeakMap<RSC_Visual,Function>      = new WeakMap()
  const RendererForVisual:WeakMap<RSC_Visual,Function>               = new WeakMap()

  const DummyHandler = () => {}

  class RSC_Visual extends HTMLElement {
    static observedAttributes:string[] = ['value']         // may be overwritten

  /**** constructor ****/

    public constructor () {       // already with all attributes and inner nodes
      super()

      const ShadowRoot = this.attachShadow({ mode:'closed' })
      ShadowRootForVisual.set(this,ShadowRoot)
    }

  /**** connectedCallback - elements are added from the outside in ****/

    public connectedCallback () {
      if (RSC_isRunning) { startVisual(this) }
    }

  /**** disconnectedCallback - elements are removed from the outside in ****/

    public disconnectedCallback () {
      startReactiveRenderingOfVisual(this)

//    unregisterAllReactiveFunctionsFrom(this) // TODO: better before removal
      unregisterAllReactiveAttributesOfVisual(this)

      let DetachmentHandler = DetachmentHandlerForVisual.get(this)
      if (DetachmentHandler != null) {
        try {
          DetachmentHandler.call(this)
        } catch (Signal) {
console.error('detachment handler failure',Signal)
          setErrorOfVisual(this,{
            Title:'Detachment Handler Failure',
            Message:'Running the configured detachment handler failed\n\n' +
                    'Reason: ' + Signal
          })
        }
      }
    }

  /**** attributeChangedCallback ****/

    public attributeChangedCallback (
      normalizedName:string, oldValue:string, newValue:string
    ) {
      if (VisualWasInitialized(this) && ! ValueIsReactiveAttributeName(normalizedName)) {
        updateAttributeOfVisual(this, normalizedName, newValue)
      }
    }

  /**** observed ****/

    public get observed ():Indexable  { return ObservablesOfVisual(this) }
    public set observed (_:Indexable) { throwReadOnlyError('observable') }

  /**** unobserved ****/

    public get unobserved ():Indexable  { return InternalsOfVisual(this) }
    public set unobserved (_:Indexable) { throwReadOnlyError('unobserved') }

  /**** onAttributeChange (originalName, newValue) ****/

    public onAttributeChange (newHandler:Function):void {
      expectFunction('visual attribute change handler',newHandler)
      AttributeChangeHandlerForVisual.set(this,newHandler)
    }

  /**** onAttachment () ****/

    public onAttachment (newHandler:Function):void {
      expectFunction('visual attachment handler',newHandler)
      AttachmentHandlerForVisual.set(this,newHandler)
    }

  /**** onDetachment () ****/

    public onDetachment (newHandler:Function):void {
      expectFunction('visual detachment handler',newHandler)
      DetachmentHandlerForVisual.set(this,newHandler) || DummyHandler
    }

  /**** Renderer ****/

    public toRender (newHandler:Function) {
      expectFunction('visual renderer',newHandler)
      RendererForVisual.set(this,newHandler)
    }

  /**** render ****/

    public render ():void {
      if (VisualWasInitialized(this)) {
        let Rendering
        if (! this.hasError) {
          const Renderer = RendererForVisual.get(this)
          if (Renderer == null) {
            if (this.tagName === 'RSC-VISUAL') {
              Rendering = html`${this.observed['Value']}<slot/>`
            }
          } else {
            try {
              Rendering = Renderer.call(this)
            } catch (Signal) {
console.error('rendering failure',Signal)
              setErrorOfVisual(this,{
                Title:'Rendering Failure',
                Message:'Running the configured renderer failed, reason: ' + Signal
              })
            }
          }
        }

        const ShadowRoot = ShadowRootForVisual.get(this)
        if (this.hasError) {
          render(html`<${RSC_ErrorIndicator} visual=${this}/>`,ShadowRoot)
        } else {
          render(html`${Rendering}`,ShadowRoot)
        }
      }
    }

  /**** hasError ****/

    public get hasError ():boolean  { return (this.Error != null) }
    public set hasError (_:boolean) { throwReadOnlyError('hasError') }

  /**** Error ****/

    public get Error ():RSC_ErrorInfo|undefined {
      return ErrorOfVisual(this)
    }
    public set Error (ErrorInfo:RSC_ErrorInfo|undefined) {
      setErrorOfVisual(this,ErrorInfo)
    }
  }

  customElements.define('rsc-visual', RSC_Visual)

/**** startAllAppletsInDocument ****/

  function startAllAppletsInDocument ():void {
    document.body.querySelectorAll('rsc-applet,[behaviour="applet"]').forEach(
      (DOMElement) => {
        if (ValueIsVisual(DOMElement)) { startVisual(DOMElement as RSC_Visual) }
      }
    )
  }

/**** startAllVisualsIn ****/

  function startAllVisualsIn (DOMElement:Element):void {
    Array.from(DOMElement.children).forEach((innerElement) => {
      if (ValueIsVisual(innerElement)) { startVisual(innerElement as RSC_Visual) }
      startAllVisualsIn(innerElement)
    })
  }

/**** startVisual ****/

  function startVisual (Visual:RSC_Visual):void {
    validateContainerOfVisual(Visual)    // throws if inacceptable for container

    if (VisualWasInitialized(Visual)) {
      unregisterAllReactiveAttributesOfVisual(Visual)
      registerAllReactiveAttributesOfVisual(Visual)
    } else {
//    registerAllBehavioursFoundInVisual(Visual)
      registerAllDelegatedScriptsFoundInVisual(Visual)

      validateContentsOfVisual(Visual)

      applyBehaviourScriptOfVisual(Visual)
      applyElementScriptOfVisual(Visual)

      updateAllAttributesOfVisual(Visual)    // setters should be defined by now
      registerAllReactiveAttributesOfVisual(Visual)

      markVisualAsInitialized(Visual)             // outer visuals are now known
    }

    startReactiveRenderingOfVisual(Visual)                   // also renders now

    let AttachmentHandler = AttachmentHandlerForVisual.get(Visual)
    if (AttachmentHandler != null) {
      try {
        AttachmentHandler.call(Visual)
      } catch (Signal) {
console.error('attachment handler failure',Signal)
        setErrorOfVisual(Visual,{
          Title:'Attachment Handler Failure',
          Message:'Running the configured attachment handler failed\n\n' +
                  'Reason: ' + Signal
        })
      }
    }

    startAllVisualsIn(Visual)
  }



/**** start-up in a well-defined way ****/

  document.addEventListener("readystatechange", (Event) => {
    if (document.readyState === 'complete') {
      registerAllBehavioursFoundInHead()

      RSC_isRunning = true
      startAllAppletsInDocument()
    }
  })
}

export const {
  assign, isRunning,
  throwReadOnlyError,
  ValueIsDOMElement, allowDOMElement, allowedDOMElement, expectDOMElement, expectedDOMElement,
  ValueIsVisual, allowVisual, allowedVisual, expectVisual, expectedVisual,
  ValueIsName, allowName, allowedName, expectName, expectedName,
  ValueIsErrorInfo, allowErrorInfo, allowedErrorInfo, expectErrorInfo, expectedErrorInfo,
  newUUID,
  outerVisualOf,VisualContaining, outermostVisualOf,
  closestVisualWithBehaviour, closestVisualMatching,
  innerVisualsOf,
  registerBehaviour
} = RSC
