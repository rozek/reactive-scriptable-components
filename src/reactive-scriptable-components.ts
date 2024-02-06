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
  ValueIsOneOf,
  ValueIsColor, ValueIsURL,
  ValidatorForClassifier, acceptNil, rejectNil,
  allowBoolean, expectBoolean,
  allowNumber, expectNumber, allowNumberInRange, expectNumberInRange,
  allowInteger, expectInteger, allowIntegerInRange, expectIntegerInRange,
  allowString, expectString, allowStringMatching, expectStringMatching,
    allowText, expectText, allowTextline, expectTextline, expectedTextline,
  expectFunction,
  allowList, expectList, allowListSatisfying, expectListSatisfying,
  expectInstanceOf,
  allowOneOf, allowedOneOf, expectOneOf,
  allowColor, expectColor,
  allowURL, expectURL,
  HexColor,
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

  assign(RSC,{ render, html, Component }, { observe, computed, dispose })

  let RSC_isRunning:boolean = false               // has to be initialized early

//------------------------------------------------------------------------------
//--                             Type Definitions                             --
//------------------------------------------------------------------------------

  export type Textline = string              // mainly for illustrative purposes
  export type Text     = string                                          // dto.
  export type URL      = string                                          // dto.

  export type RSC_UUID = string                                          // dto.
  export type RSC_Name = string                                          // dto.

/**** throwReadOnlyError ****/

// @ts-ignore TS2534 why is TS complaining here?
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

    const normalizedName = normalizedBehaviourName(BehaviourName)
    while (DOMElement != null) {
      if (
        ValueIsVisual(DOMElement) &&
        (normalizedBehaviourName(BehaviourNameOfVisual(DOMElement as RSC_Visual) || '') === normalizedName)
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
    return BehaviourRegistry[normalizedBehaviourName(Name)]
  }

/**** registerBehaviour ****/

  export function registerBehaviour (
    Name:RSC_Name, SourceOrExecutable:Text|Function|undefined,
    observedAttributes:RSC_Name[] = []
  ):void {
    expectName('behaviour name',Name)
console.log('registering behaviour',Name)

    if ((SourceOrExecutable != null) && ! ValueIsFunction(SourceOrExecutable)) {
      expectText('behaviour script',SourceOrExecutable)
      if ((SourceOrExecutable as string).trim() === '') { SourceOrExecutable = undefined }
    }

    allowListSatisfying(
      'list of observed element attributes', observedAttributes, ValueIsName
    )

    let normalizedName = normalizedBehaviourName(Name)

    const AttributeSet = Object.create(null)
    if (observedAttributes != null) {
      observedAttributes.forEach(
        (internalName) => AttributeSet[normalizedAttributeName(internalName)] = internalName
      )
      observedAttributes = observedAttributes.map((Name) => normalizedAttributeName(Name))
    }

    if ((SourceOrExecutable == null) || ValueIsFunction(SourceOrExecutable)) {
      BehaviourRegistry[normalizedName] = {
        Name, AttributeSet, Executable:SourceOrExecutable as Function
      }
    } else {
      if (normalizedName in BehaviourRegistry) {
        const BehaviourInfo = BehaviourRegistry[normalizedName]
        if (BehaviourInfo.Source == null) throwError(
          'ForbiddenOperation: cannot overwrite intrinsic behaviour ' + quoted(Name)
        )

// @ts-ignore we know that "BehaviourInfo.Source != null"
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

  BehaviourRegistry['applet'] = {
    Name:'Applet', AttributeSet:{ value:'Value' }
  }

/**** registerBehaviourFromElement ****/

  function registerBehaviourFromElement (ScriptElement:Element):void {
    let Name = expectedName(
      'behaviour name',ScriptElement.getAttribute('for-behaviour')
    )
    if (normalizedBehaviourName(Name) === 'visual') throwError(
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

/**** registerAllBehavioursFoundInHeadAndBody ****/

  function registerAllBehavioursFoundInHeadAndBody ():void {
    innerElementsOf(document.head).forEach((Element) => {
      if (Element.matches('script[type="rsc-script"][for-behaviour]')) {
        registerBehaviourFromElement(Element)
      }
    })

    innerElementsOf(document.body).forEach((Element) => {
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

/**** normalizedBehaviourName ****/

  function normalizedBehaviourName (originalName:string):string {
    return originalName.toLowerCase()
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
      const normalizedName = normalizedBehaviourName(BehaviourName)
      permittedVisualsSelectorWithinBehaviour[normalizedName] = Selector
    }
  }

/**** forbidVisualsWithinBehaviour ****/

  function forbidVisualsWithinBehaviour (
    BehaviourName:RSC_Name, Selector:string
  ):void {
    Selector = Selector.trim()
    if (Selector !== '') {
      const normalizedName = normalizedBehaviourName(BehaviourName)
      forbiddenVisualsSelectorWithinBehaviour[normalizedName] = Selector
    }
  }

/**** validateContentsOfVisual ****/

  function validateContentsOfVisual (Visual:RSC_Visual):void {
    const BehaviourName = BehaviourNameOfVisual(Visual)
    if (BehaviourName == null) { return }

    const normalizedName = normalizedBehaviourName(BehaviourName)
    let permittedVisualsSelector = permittedVisualsSelectorWithinBehaviour[normalizedName]
    let forbiddenVisualsSelector = forbiddenVisualsSelectorWithinBehaviour[normalizedName]

    if ((permittedVisualsSelector != null) || (forbiddenVisualsSelector != null)) {
      innerVisualsOf(Visual).forEach((innerVisual) => {
        if ((
          (permittedVisualsSelector != null) &&
          ! innerVisual.matches(permittedVisualsSelector)
        ) || (
          (forbiddenVisualsSelector != null) &&
          innerVisual.matches(forbiddenVisualsSelector)
        )) {
console.log('removing inner visual',innerVisual,'from',Visual)
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

    const normalizedName = normalizedBehaviourName(BehaviourName)

    let permittedVisualsSelector = permittedVisualsSelectorWithinBehaviour[normalizedName]
    if (permittedVisualsSelector != null) {
      if (! Visual.matches(permittedVisualsSelector)) throwError(
        'InacceptableInnerVisual: the given visual is not allowed to become a ' +
        'part of its container'
      )
    }

    let forbiddenVisualsSelector = forbiddenVisualsSelectorWithinBehaviour[normalizedName]
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

// @ts-ignore TS2454 we know that "Executable != null"
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
      'toRender, html, on,once,off,trigger, reactively, ShadowRoot',
      Script || ''
    )                                                                // may fail!
  }

/**** applyExecutable - throws on failure ****/

  function applyExecutable (Visual:RSC_Visual, Executable:Function):void {
    const onAttributeChange = Visual.onAttributeChange.bind(Visual)
    const onAttachment      = Visual.onAttachment     .bind(Visual)
    const onDetachment      = Visual.onDetachment     .bind(Visual)
    const toRender          = Visual.toRender         .bind(Visual)
    const ShadowRoot        = ShadowRootForVisual.get(Visual)

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
      EventToTrigger:string|Event, Arguments:any[] = [],
      bubbles = true
    ):boolean {
      Arguments = (ValueIsArray(Arguments) ? Arguments.slice() : [Arguments])

      switch (true) {
        case ValueIsString(EventToTrigger):
          EventToTrigger = new CustomEvent(
            (EventToTrigger as string).toLowerCase(), {
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
        default: throwError(
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
      toRender, html, on,once,off,trigger, reactively, ShadowRoot
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
      Visual, Events.toLowerCase(),Selector,Data,Handler, once
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
    ;(actualHandler as indexableFunction)['isFor'] = Handler

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

    EventList.forEach((Event:string) => {
      Event = Event.toLowerCase()

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

  const ignoredAttributesForVisual:WeakMap<RSC_Visual,Indexable> = new WeakMap()

/**** observed/unobserved ****/

  const globalObservables = observe({},{ deep:false, batch:true })
  const globalInternals   = {}

  export var observed:Indexable   = {}           // will be replaced in a moment
  export var unobserved:Indexable = {}                                   // dto.

  assign(RSC,{
    get observed ():Indexable  { return globalObservables },
    set observed (_:Indexable) { throwReadOnlyError('observed') },

    get unobserved ():Indexable  { return globalInternals },
    set unobserved (_:Indexable) { throwReadOnlyError('unobserved') },
  })

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

          if (! VisualAttributeIsIgnored(Visual,reactiveName)) {
            const Handler = computed(() => {
              Visual.observed[originalName] = ValueOfReactiveVariable(Base, PathList)
            })
            HandlerList.push(Handler)
          }

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
    Base:RSC_Visual|typeof RSC,
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

    let Base:RSC_Visual|typeof RSC

    let Selector = literalPath.slice(0,SplitIndex)
    if (Selector === 'RSC') {
      Base = RSC
    } else {
      if (ValueIsName(Selector)) {
        const normalizedName = Selector.toLowerCase()
        Selector = `rsc-${normalizedName},[behaviour="${normalizedName}"]`
      }

      Base = closestVisualMatching(Visual,Selector) as RSC_Visual
      if (Base == null) throwError(
        'NoSuchVisual:could not find a close visual matching CSS selector' +
        quoted(Selector)
      )
    }

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

  function ValueOfReactiveVariable (
    Base:RSC_Visual|typeof RSC, PathList:string[]
  ):any {
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
    Base:RSC_Visual|typeof RSC, PathList:string[], Value:any
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

/**** normalizedAttributeName ****/

  function normalizedAttributeName (originalName:string):string {
    let Result = originalName.replace(/^[$]{1,2}/,'')
    return (
      Result[0].toLowerCase() +
      Result.slice(1).replace(/[A-Z]+/g,function (Match) {
        return (
          Match.length === 1
          ? '-' + Match.toLowerCase()
          : Match.slice(0,-1).toLowerCase() + '-' + Match.slice(-1).toLowerCase()
        )
      })
    )
  }

/**** ignoreAttributeOfVisual (i.e., attribute should only be reactively read) ****/

  function ignoreAttributeOfVisual (Visual:RSC_Visual, Attribute:string):void {
    Attribute = Attribute.replace(/^[$]{1,2}/,'')

    let ignoredAttributes = ignoredAttributesForVisual.get(Visual)
    if (ignoredAttributes == null) {
      ignoredAttributesForVisual.set(Visual, ignoredAttributes = Object.create(null))
    }
    (ignoredAttributes as Indexable)[Attribute] = true
  }

/**** VisualAttributeIsIgnored ****/

  function VisualAttributeIsIgnored (Visual:RSC_Visual, Attribute:string):boolean {
    Attribute = Attribute.replace(/^[$]{1,2}/,'')
    return (ignoredAttributesForVisual.get(Visual)?.[Attribute] == true)
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
    public set observed (_:Indexable) { throwReadOnlyError('observed') }

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
            Rendering = html`
              <style>
                :host { display:inline-block; position:relative }
              </style>
              ${this.observed.Value}
              <slot/>
            `
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
    }  /**** Applet ****/

    public get Applet ():RSC_Visual|undefined {
      return closestVisualWithBehaviour(this,'Applet')
    }
    public set Applet (_:RSC_Visual|undefined) { throwReadOnlyError('Applet') }

  /**** Card ****/

    public get Card ():RSC_Visual|undefined {
      return closestVisualWithBehaviour(this,'Card')
    }
    public set Card (_:RSC_Visual|undefined) { throwReadOnlyError('Card') }

  /**** outerVisual ****/

    public get outerVisual ():RSC_Visual|undefined {
      return outerVisualOf(this)
    }
    public set outerVisual (_:RSC_Visual|undefined) { throwReadOnlyError('outerVisual') }

  /**** outermostVisual ****/

    public get outermostVisual ():RSC_Visual|undefined {
      return outermostVisualOf(this)
    }
    public set outermostVisual (_:RSC_Visual|undefined) { throwReadOnlyError('outermostVisual') }

  /**** innerVisuals ****/

    public get innerVisuals ():RSC_Visual[] {
      return innerVisualsOf(this)
    }
    public set innerVisuals (_:RSC_Visual[]) { throwReadOnlyError('innerVisuals') }

  /**** innerElements ****/

    public get innerElements ():Element[] {
      return innerElementsOf(this)
    }
    public set innerElements (_:Element[]) { throwReadOnlyError('innerElements') }

  /**** closestVisualWithBehaviour ****/

    public closestVisualWithBehaviour (BehaviourName:RSC_Name):RSC_Visual|undefined {
      return closestVisualWithBehaviour(this,BehaviourName)
    }

  /**** closestOuterVisualWithBehaviour ****/

    public closestOuterVisualWithBehaviour (BehaviourName:RSC_Name):RSC_Visual|undefined {
      const outerVisual = outerVisualOf(this)
      return (
        outerVisual == null
        ? undefined
        : closestVisualWithBehaviour(outerVisual,BehaviourName)
      )
    }

  /**** closestVisualMatching ****/

    public closestVisualMatching (Selector:Textline):RSC_Visual|undefined {
      return closestVisualMatching(this,Selector)
    }

  /**** closestOuterVisualMatching ****/

    public closestOuterVisualMatching (Selector:Textline):RSC_Visual|undefined {
      const outerVisual = outerVisualOf(this)
      return (
        outerVisual == null
        ? undefined
        : closestVisualMatching(outerVisual,Selector)
      )
    }

  /**** innerVisualsWithBehaviour ****/

    public innerVisualsWithBehaviour (BehaviourName:RSC_Name):RSC_Visual[] {
      expectName('behaviour name',BehaviourName)

      return innerVisualsOf(this).filter(
        (Visual) => BehaviourNameOfVisual(Visual) === BehaviourName
      )
    }

  /**** innerVisualsMatching ****/

    public innerVisualsMatching (Selector:Textline):RSC_Visual[] {
      expectTextline('CSS selector',Selector)

      return innerVisualsOf(this).filter(
        (Visual) => Visual.matches(Selector)
      )
    }

  /**** innerElementsMatching ****/

    public innerElementsMatching (Selector:Textline):Element[] {
      expectTextline('CSS selector',Selector)

      return innerElementsOf(this).filter(
        (Element) => Element.matches(Selector)
      )
    }
  }

  customElements.define('rsc-visual', RSC_Visual)

//------------------------------------------------------------------------------
//--                                RSC_Applet                                --
//------------------------------------------------------------------------------

  class RSC_Applet extends RSC_Visual {
    static observedAttributes:string[] = ['value']         // may be overwritten

    public constructor () {       // already with all attributes and inner nodes
      super()
      RendererForVisual.set(this, function render () {
        return html`
          <style>
            :host {
              display:block; position:relative;
              background:white; color:black;
              font-size:14px; font-weight:normal; line-height:1.4;
            }
          </style>
          <slot/>
        `
      })
    }
  }

  customElements.define('rsc-applet', RSC_Applet)

//------------------------------------------------------------------------------
//--                      Property Convenience Functions                      --
//------------------------------------------------------------------------------

/**** BooleanProperty ****/

  export function BooleanProperty (
    my:RSC_Visual, PropertyName:string, Default?:boolean,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():boolean { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:boolean) { throwReadOnlyError(PropertyName) }
          : function (newValue:boolean) {
              ;(Default === undefined ? expectBoolean : allowBoolean)(
                Description || ('"' + PropertyName + '" setting'), newValue
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** BooleanListProperty ****/

  export function BooleanListProperty (
    my:RSC_Visual, PropertyName:string, Default?:boolean[],
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():boolean[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:boolean[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:boolean[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, ValueIsBoolean
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as boolean[]).slice()
            }
        )
      })
    return Descriptor
  }

/**** NumberProperty ****/

  export function NumberProperty (
    my:RSC_Visual, PropertyName:string, Default?:number,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():number { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:number) { throwReadOnlyError(PropertyName) }
          : function (newValue:number) {
              ;(Default === undefined ? expectNumber : allowNumber)(
                Description || ('"' + PropertyName + '" setting'), newValue
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** NumberListProperty ****/

  export function NumberListProperty (
    my:RSC_Visual, PropertyName:string, Default?:number[],
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():number[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:number[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:number[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, ValueIsNumber
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as number[]).slice()
            }
        )
      })
    return Descriptor
  }

/**** NumberPropertyInRange ****/

  export function NumberPropertyInRange (
    my:RSC_Visual, PropertyName:string,
    lowerLimit?:number, upperLimit?:number, withLower:boolean = false, withUpper:boolean = false,
    Default?:number, Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():number { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:number) { throwReadOnlyError(PropertyName) }
          : function (newValue:number) {
              ;(Default === undefined ? expectNumberInRange : allowNumberInRange)(
                Description || ('"' + PropertyName + '" setting'), newValue,
                lowerLimit,upperLimit, withLower,withUpper
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** NumberListPropertyInRange ****/

  export function NumberListPropertyInRange (
    my:RSC_Visual, PropertyName:string,
    lowerLimit?:number, upperLimit?:number, withLower:boolean = false, withUpper:boolean = false,
    Default?:number[], Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():number[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:number[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:number[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, (Value) => {
                  return ValueIsNumberInRange(Value, lowerLimit,upperLimit, withLower,withUpper)
                }
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as number[]).slice()
            }
        )
      })
    return Descriptor
  }

/**** IntegerProperty ****/

  export function IntegerProperty (
    my:RSC_Visual, PropertyName:string, Default?:number,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():number { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:number) { throwReadOnlyError(PropertyName) }
          : function (newValue:number) {
              ;(Default === undefined ? expectInteger : allowInteger)(
                Description || ('"' + PropertyName + '" setting'), newValue
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** IntegerListProperty ****/

  export function IntegerListProperty (
    my:RSC_Visual, PropertyName:string, Default?:number[],
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():number[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:number[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:number[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, ValueIsInteger
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as number[]).slice()
            }
        )
      })
    return Descriptor
  }

/**** IntegerPropertyInRange ****/

  export function IntegerPropertyInRange (
    my:RSC_Visual, PropertyName:string,
    lowerLimit?:number, upperLimit?:number, Default?:number,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():number { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:number) { throwReadOnlyError(PropertyName) }
          : function (newValue:number) {
              ;(Default === undefined ? expectIntegerInRange : allowIntegerInRange)(
                Description || ('"' + PropertyName + '" setting'), newValue,
                lowerLimit,upperLimit
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** IntegerListPropertyInRange ****/

  export function IntegerListPropertyInRange (
    my:RSC_Visual, PropertyName:string,
    lowerLimit?:number, upperLimit?:number, Default?:number[],
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():number[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:number[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:number[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, (Value) => {
                  return ValueIsIntegerInRange(Value, lowerLimit,upperLimit)
                }
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as number[]).slice()
            }
        )
      })
    return Descriptor
  }

/**** StringProperty ****/

  export function StringProperty (
    my:RSC_Visual, PropertyName:string, Default?:string,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:string) { throwReadOnlyError(PropertyName) }
          : function (newValue:string) {
              ;(Default === undefined ? expectString : allowString)(
                Description || ('"' + PropertyName + '" setting'), newValue
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** StringListProperty ****/

  export function StringListProperty (
    my:RSC_Visual, PropertyName:string, Default?:string[],
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:string[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:string[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, ValueIsString
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as string[]).slice()
            }
        )
      })
    return Descriptor
  }

/**** StringPropertyMatching ****/

  export function StringPropertyMatching (
    my:RSC_Visual, PropertyName:string, Pattern:RegExp, Default?:string,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:string) { throwReadOnlyError(PropertyName) }
          : function (newValue:string) {
              ;(Default === undefined ? expectStringMatching : allowStringMatching)(
                Description || ('"' + PropertyName + '" setting'), newValue, Pattern
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** StringListPropertyMatching ****/

  export function StringListPropertyMatching (
    my:RSC_Visual, PropertyName:string, Pattern:RegExp, Default?:string[],
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:string[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:string[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, (Value) => {
                  return ValueIsStringMatching(Value,Pattern)
                }
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as string[]).slice()
            }
        )
      })
    return Descriptor
  }

/**** TextProperty ****/

  export function TextProperty (
    my:RSC_Visual, PropertyName:string, Default?:string,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:string) { throwReadOnlyError(PropertyName) }
          : function (newValue:string) {
              ;(Default === undefined ? expectText : allowText)(
                Description || ('"' + PropertyName + '" setting'), newValue
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** TextlineProperty ****/

  export function TextlineProperty (
    my:RSC_Visual, PropertyName:string, Default?:string,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:string) { throwReadOnlyError(PropertyName) }
          : function (newValue:string) {
              ;(Default === undefined ? expectTextline : allowTextline)(
                Description || ('"' + PropertyName + '" setting'), newValue
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** ListProperty ****/

  export function ListProperty (
    my:RSC_Visual, PropertyName:string, Default?:string,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string { return (my.unobserved[PropertyName] || []).slice() },
        set: (readonly
          ? function (_:string) { throwReadOnlyError(PropertyName) }
          : function (newValue:string) {
              ;(Default === undefined ? expectList : allowList)(
                Description || ('"' + PropertyName + '" setting'), newValue
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue.slice())
            }
        )
      })
    return Descriptor
  }

/**** ListSatisfyingProperty ****/

  export function ListSatisfyingProperty (
    my:RSC_Visual, PropertyName:string, Validator:(Value:any) => boolean,
    Default?:string, Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string { return (my.unobserved[PropertyName] || []).slice() },
        set: (readonly
          ? function (_:string) { throwReadOnlyError(PropertyName) }
          : function (newValue:string) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue,
                Validator
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue.slice())
            }
        )
      })
    return Descriptor
  }

/**** OneOfProperty ****/

  export function OneOfProperty (
    my:RSC_Visual, PropertyName:string, allowedValues:string[], Default?:string,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:string) { throwReadOnlyError(PropertyName) }
          : function (newValue:string) {
              ;(Default === undefined ? expectOneOf : allowOneOf)(
                Description || ('"' + PropertyName + '" setting'), newValue, allowedValues
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** OneOfListProperty ****/

  export function OneOfListProperty (
    my:RSC_Visual, PropertyName:string, allowedValues:string[], Default?:string[],
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:string[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:string[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, (Value) => {
                  return ValueIsOneOf(Value,allowedValues)
                }
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as string[]).slice()
            }
        )
      })
    return Descriptor
  }

/**** ColorProperty ****/

  export function ColorProperty (
    my:RSC_Visual, PropertyName:string, Default?:string,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:string) { throwReadOnlyError(PropertyName) }
          : function (newValue:string) {
              ;(Default === undefined ? expectColor : allowColor)(
                Description || ('"' + PropertyName + '" setting'), newValue
              )
              my.unobserved[PropertyName] = (
                newValue == null ? Default : HexColor(newValue)
              )
            }
        )
      })
    return Descriptor
  }

/**** ColorListProperty ****/

  export function ColorListProperty (
    my:RSC_Visual, PropertyName:string, Default?:string[],
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:string[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:string[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, ValueIsColor
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as string[]).map((Color) => HexColor(Color))
            }
        )
      })
    return Descriptor
  }

/**** URLProperty ****/

  export function URLProperty (
    my:RSC_Visual, PropertyName:string, Default?:string,
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string { return my.unobserved[PropertyName] },
        set: (readonly
          ? function (_:string) { throwReadOnlyError(PropertyName) }
          : function (newValue:string) {
              ;(Default === undefined ? expectURL : allowURL)(
                Description || ('"' + PropertyName + '" setting'), newValue
              )
              my.unobserved[PropertyName] = (newValue == null ? Default : newValue)
            }
        )
      })
    return Descriptor
  }

/**** URLListProperty ****/

  export function URLListProperty (
    my:RSC_Visual, PropertyName:string, Default?:string[],
    Description?:string, readonly:boolean = false
  ):object {
    let Descriptor = {}
      Object.defineProperty(Descriptor, PropertyName, {
        configurable:true, enumerable:true,
        get: function ():string[] {
          let Value = my.unobserved[PropertyName]
          return (Value == null ? [] : Value.slice())
        },
        set: (readonly
          ? function (_:string[]) { throwReadOnlyError(PropertyName) }
          : function (newValue:string[]) {
              ;(Default === undefined ? expectListSatisfying : allowListSatisfying)(
                Description || ('"' + PropertyName + '" setting'), newValue, ValueIsURL
              )
              my.unobserved[PropertyName] = ((
                newValue == null ? Default : newValue
              ) as string[]).slice()
            }
        )
      })
    return Descriptor
  }

//------------------------------------------------------------------------------
//--                     Attribute Convenience Functions                      --
//------------------------------------------------------------------------------

/**** handleEventAttributes ****/

  export function handleEventAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, ...EventNames:string[]
  ):boolean {
    let foundSomething = false
      EventNames.forEach((EventName) => {
        const AttributeName = EventName.toLowerCase()
        if (
          (reportedName === 'on'  + AttributeName) ||
          (reportedName === 'on-' + AttributeName)
        ) {
          foundSomething = true

          if (reportedValue == null) {
            unregisterAllMatchingEventHandlersFromVisual(my,EventName)
          } else {
            let compiledFunction:Function|undefined = undefined
            try {
              compiledFunction = new Function('Event',reportedValue)
            } catch (Signal) {
              throwError(
                'CompilationFailure: could not compile handler for event "' +
                EventName + '" from Attribute "' + reportedName + '", reason: ' +
                Signal
              )
            }

            registerEventHandlerForVisual(my, EventName, compiledFunction)
          }
        }
      })
    return foundSomething
  }
  export const handleEventAttributes = handleEventAttribute

/**** ignoreAttribute (i.e., attribute should only be reactively read) ****/

  export function ignoreAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    ignoreAttributeOfVisual(my,AttributeName)

    return (reportedName === AttributeName)
  }

/**** handleBooleanAttribute ****/

  export function handleBooleanAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    if (reportedName === AttributeName) {
      allowOneOf('"' + AttributeName + '" attribute',reportedValue,[
        AttributeName, '', 'true', 'false'
      ])

      let newValue = (reportedValue != null) && (reportedValue !== 'false')
      my.observed[PropertyName || Name] = newValue

      return true                      // because the attribute has been handled
    } else {
      return false
    }
  }

/**** handleBooleanListAttribute ****/

  export function handleBooleanListAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    if (reportedName === AttributeName) {
      let newValue = (reportedValue || '').trim().split(/\s*,\s*|\n/)
        .map((Value,i) => allowedOneOf(
          '"' + AttributeName + '" attribute entry #' + (i+1),
          Value.trim(), ['true', 'false']
        ) === 'true')
      my.observed[PropertyName || Name] = newValue

      return true                      // because the attribute has been handled
    } else {
      return false
    }
  }

/**** handleNumericAttribute ****/

  export function handleNumericAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    if (reportedName === AttributeName) {
      if (reportedValue == null) {
        my.observed[PropertyName || Name] = undefined
      } else {
        let newValue = parseFloat(reportedValue)
        if (isNaN(newValue)) throwError(
          'InvalidAttribute: invalid "' + AttributeName + '" attribute given'
        )

        my.observed[PropertyName || Name] = newValue
      }
      return true                      // because the attribute has been handled
    } else {
      return false
    }
  }

/**** handleNumericListAttribute ****/

  export function handleNumericListAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    if (reportedName === AttributeName) {
      let newValue = (reportedValue || '').trim().split(/\s*,\s*|\n/)
        .map((Value,i) => {
          let newValue = parseFloat(Value)
            if (isNaN(newValue)) throwError(
              'InvalidAttribute: "' + AttributeName + '" attribute entry #' +
              (i+1) + ' is not a valid number'
            )
          return newValue
        })
      my.observed[PropertyName || Name] = newValue

      return true                      // because the attribute has been handled
    } else {
      return false
    }
  }

/**** handleLiteralAttribute ****/

  export function handleLiteralAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    if (reportedName === AttributeName) {
      my.observed[PropertyName || Name] = reportedValue
      return true                      // because the attribute has been handled
    } else {
      return false
    }
  }

/**** handleLiteralListAttribute (allows empty entries) ****/

  export function handleLiteralListAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    if (reportedName === AttributeName) {
      let newValue = (reportedValue || '').trim().split(/\s*,\s*|\n/)
        .map((Line) => Line.trim())
      my.observed[PropertyName || Name] = newValue

      return true                      // because the attribute has been handled
    } else {
      return false
    }
  }

/**** handleLiteralLinesAttribute (allows empty entries) ****/

  export function handleLiteralLinesAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    if (reportedName === AttributeName) {
      let newValue = (reportedValue || '').trim().split(/\n/)
        .map((Line) => Line.trim())
      my.observed[PropertyName || Name] = newValue

      return true                      // because the attribute has been handled
    } else {
      return false
    }
  }

/**** handleSettingOrKeywordAttribute ****/

  export function handleSettingOrKeywordAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string,
    permittedValues:string[], permittedKeywords?:string[],
    PropertyName?:string,
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)

  /**** take care of removed attributes ****/

    let foundSomething = (reportedName == AttributeName)
    if (! foundSomething) {
      (permittedKeywords || permittedValues).forEach((Keyword) => {
        let KeywordName = normalizedAttributeName(Keyword)
        if (reportedName === KeywordName) { foundSomething = true }
      })
    }
    if (! foundSomething) { return false }

  /**** compare all related values ****/

    let newSetting:string|undefined|null = undefined
      if (my.hasAttribute(AttributeName)) {
        const AttributeValue = my.getAttribute(AttributeName)
        allowOneOf('"' + AttributeName + '" attribute',AttributeValue, permittedValues)

        newSetting     = AttributeValue             // may event set "undefined"
        foundSomething = true
      }

      (permittedKeywords || permittedValues).forEach((Keyword) => {
        let KeywordName = normalizedAttributeName(Keyword)
        if (my.hasAttribute(KeywordName)) {
          const KeywordValue = my.getAttribute(KeywordName)
          allowOneOf('"' + KeywordName + '" attribute',KeywordValue,[
            KeywordName, '', 'true', 'false'
          ])

          if (KeywordValue !== 'false') {
            switch (true) {
              case newSetting == null:     newSetting = Keyword; break
              case newSetting === Keyword: break
              default: throwError(
                'ConflictingAttributes: conflicting "' + AttributeName + '" attribute found'
              )
            }
          }
        }
      })
    my.observed[PropertyName || Name] = newSetting
    return true                        // because the attribute has been handled
  }

/**** handleJSONAttribute ****/

  export function handleJSONAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    if (reportedName === AttributeName) {
      let JSONObject
        if ((reportedValue != null) && (reportedValue.trim() === '')) {
          reportedValue = undefined
        }

        if (reportedValue != null) {
          try {
            JSONObject = JSON.parse(reportedValue)
          } catch (Signal) {
            throwError(
              'InvalidAttribute: the given "' + AttributeName + '" ' +
              'attribute is not a valid JSON string'
            )
          }
        }
      my.observed[PropertyName || Name] = JSONObject
      return true                      // because the attribute has been handled
    } else {
      return false
    }
  }

/**** handleJSONLinesAttribute ****/

  export function handleJSONLinesAttribute (
    reportedName:string, reportedValue:string|undefined,
    my:RSC_Visual, Name:string, PropertyName?:string
  ):boolean {
    const AttributeName = normalizedAttributeName(Name)
    if (reportedName === AttributeName) {
      let JSONLines
        if (reportedValue != null) {
          JSONLines = reportedValue.trim().split('\n').map((Line,i) => {
            try {
              return JSON.parse(reportedValue)
            } catch (Signal) {
              throwError(
                'InvalidAttribute: line #' + (i+1) + ' in the given ' +
                '"' + AttributeName + '" attribute is not a valid JSON string'
              )
            }
          })
        }
      my.observed[PropertyName || Name] = JSONLines
      return true                      // because the attribute has been handled
    } else {
      return false
    }
  }

/**** isRunning ****/

  export function isRunning () { return RSC_isRunning }

/**** runAllScriptsInHeadAndBody ****/

  function runAllScriptsInHeadAndBody ():void {
    innerElementsOf(document.head).forEach((Element) => {
      if (Element.matches('script[type="rsc-script"]')) {
        if (Element.hasAttribute('for'))           { return }
        if (Element.hasAttribute('for-behaviour')) { return }

        runScriptFromElement(Element)
      }
    })

    innerElementsOf(document.body).forEach((Element) => {
      if (Element.matches('script[type="rsc-script"]')) {
        if (Element.hasAttribute('for'))           { return }
        if (Element.hasAttribute('for-behaviour')) { return }

        runScriptFromElement(Element)
      }
    })
  }

/**** runScriptFromElement ****/

  function runScriptFromElement (ScriptElement:Element):void {
    let Source = ScriptElement.innerHTML

    let Executable:Function
    try {
      Executable = new Function(
        'RSC,JIL, observe,computed,dispose', Source
      )
    } catch (Signal) {
      console.error('RSC script compilation failure',Signal)
      return
    }

    try {
      Executable(RSC,JIL, observe,computed,dispose)
    } catch (Signal) {
      console.error('RSC script execution failure',Signal)
      return
    }
  }

/**** startAllAppletsInDocument ****/

  function startAllAppletsInDocument ():void {
    document.body.querySelectorAll('rsc-applet,[behaviour="applet"]').forEach(
      (DOMElement) => {
        if (ValueIsVisual(DOMElement)) {
          let Applet = DOMElement as RSC_Visual

          let VisualToStart = outermostVisualOf(Applet) || Applet
          if (! VisualWasInitialized(VisualToStart)) {
            startVisual(VisualToStart)
          }
        }
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

  function startRSC () {
    registerAllBehavioursFoundInHeadAndBody()
    runAllScriptsInHeadAndBody()

    RSC_isRunning = true
    startAllAppletsInDocument()
  }

  if (document.readyState === 'complete') {
    startRSC()
console.log('RSC was started')
  } else {
console.log('waiting for document to become "complete"')
    document.addEventListener("readystatechange", (Event) => {
      if (document.readyState === 'complete') {
        startRSC()
console.log('RSC was finally started')
      }
    })
  }
}

const global = (new Function('return this'))()
global.RSC = RSC

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
  registerBehaviour,
  observed, unobserved,
  BooleanProperty, BooleanListProperty,
  NumberProperty, NumberListProperty, NumberPropertyInRange, NumberListPropertyInRange,
  IntegerProperty, IntegerListProperty, IntegerPropertyInRange, IntegerListPropertyInRange,
  StringProperty, StringListProperty, StringPropertyMatching, StringListPropertyMatching,
  TextProperty, TextlineProperty, ListProperty,
  OneOfProperty, OneOfListProperty,
  URLProperty, URLListProperty,
  handleEventAttribute, handleEventAttributes,
  handleBooleanAttribute, handleBooleanListAttribute,
  handleNumericAttribute, handleNumericListAttribute,
  handleLiteralAttribute, handleLiteralListAttribute, handleLiteralLinesAttribute,
  handleSettingOrKeywordAttribute,
  handleJSONAttribute, handleJSONLinesAttribute,
} = RSC
