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
    observedAttributes:RSC_Name[] = [],
    permittedContents:string = '', forbiddenContents:string = ''
  ):void {
    expectName('behaviour name',Name)

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

    permitVisualsWithinBehaviour(Name,permittedContents)
    forbidVisualsWithinBehaviour(Name,forbiddenContents)

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

console.log('registering behaviour',Name)
    registerBehaviour(
      Name, Source, observedAttributes,
      ScriptElement.getAttribute('permitted-contents') || '',
      ScriptElement.getAttribute('forbidden-contents') || ''
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
    if (Selector !== '') {
      const normalizedName = normalizedBehaviourName(BehaviourName)
      permittedVisualsSelectorWithinBehaviour[normalizedName] = Selector
    }
  }

/**** forbidVisualsWithinBehaviour ****/

  function forbidVisualsWithinBehaviour (
    BehaviourName:RSC_Name, Selector:string
  ):void {
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
              display:inline-block; position:relative;
              background:white; color:black;
              font-family:'Source Sans Pro','Helvetica Neue',Helvetica,Arial,sans-serif;
              font-size:14px; font-weight:normal; line-height:1.4;
            }
          </style>
          <slot/>
        `
      })
    }
  }

  customElements.define('rsc-applet', RSC_Applet)

  type RSC_onAttributeChange = (Callback:(Name:string,newValue:string) => void) => void
  type RSC_onAttachment = (Callback:(Visual:RSC_Visual) => void) => void
  type RSC_onDetachment = RSC_onAttachment
  type RSC_on      = (Events:string, SelectorOrHandler:string|String|null|Function, DataOrHandler?:any, Handler?:Function) => void
  type RSC_once    = RSC_on
  type RSC_off     = (Events?:string, SelectorOrHandler?:string|String|null|Function, Handler?:Function) => void
  type RSC_trigger = (EventToTrigger:string|Event, Arguments?:any[], bubbles?:boolean) => boolean

//------------------------------------------------------------------------------
//--                        rsc-title/label/text/hint                         --
//------------------------------------------------------------------------------

  document.head.insertAdjacentHTML('beforeend',`
<style>
  rsc-title { font-size:18px; font-weight:bold; margin-bottom:10px; display:block }
  rsc-label { font-size:14px; font-weight:bold }
  rsc-text  { font-size:14px; font-weight:normal }
  rsc-hint  { font-size:11px; font-weight:normal }
</style>
  `)

  registerBehaviour('Title', undefined, ['Value'])
  registerBehaviour('Label', undefined, ['Value'])
  registerBehaviour('Text',  undefined, ['Value'])
  registerBehaviour('Hint',  undefined, ['Value'])

//------------------------------------------------------------------------------
//--                               rsc-centered                               --
//------------------------------------------------------------------------------

  registerBehaviour('centered',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      toRender(() => html`
        <style>
          :host {
            display:inline-block; position:relative;
            width:100%; height:100%;
          }
        </style>

        <div style="
          display:block; position:absolute;
          left:50%; top:50%; transform:translate(-50%,-50%);
        ">
          <slot/>
        </div>
      `)
    }
  )

//------------------------------------------------------------------------------
//--                              rsc-horizontal                              --
//------------------------------------------------------------------------------

  registerBehaviour('horizontal',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const permittedAlignments = ['left','center','right', 'start','end']

      my.unobserved.Alignment = 'start'

      RSC.assign(my.observed,
        RSC.OneOfProperty(my,'Alignment',permittedAlignments),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleLiteralAttribute(Name,newValue, my,'align','Alignment')
      ))

      toRender(() => {
        const Alignment = my.observed.Alignment

        return html`
          <style>
            :host { display:inline-block; position:relative }
          </style>

          <div style="
            display:flex; position:relative; flex-flow:row nowrap;
            justify-content:${Alignment}; align-items:stretch;
            left:0px; top:0px; width:100%; height:100%;
          ">
            <slot/>
          </div>
        `
      })
    },
    ['align']
  )

//------------------------------------------------------------------------------
//--                               rsc-vertical                               --
//------------------------------------------------------------------------------

  registerBehaviour('vertical',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const permittedAlignments = ['top','center','bottom', 'start','end']

      my.unobserved.Alignment = 'start'

      RSC.assign(my.observed,
        RSC.OneOfProperty(my,'Alignment',permittedAlignments),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleLiteralAttribute(Name,newValue, my,'align','Alignment')
      ))

      toRender(() => {
        let Alignment = my.observed.Alignment
        switch (Alignment) {
          case 'top':    Alignment = 'start'; break // TODO: not always correct
          case 'bottom': Alignment = 'end';   break // TODO: not always correct
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
          </style>

          <div style="
            display:flex; position:relative; flex-flow:column nowrap;
            justify-content:${Alignment}; align-items:stretch;
            left:0px; top:0px; width:100%; height:100%;
          ">
            <slot/>
          </div>
        `
      })
    },
    ['align']
  )

//------------------------------------------------------------------------------
//--                               rsc-tabular                                --
//------------------------------------------------------------------------------

  registerBehaviour('tabular',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const permittedAlignments = ['top','middle','bottom','baseline']

      RSC.assign(my.unobserved,{
        Columns:2, ColumnStyles:[], ColumnGap:0, RowGap:0,
        verticalAlignment:'top',
      })

      RSC.assign(my.observed,
        RSC.IntegerPropertyInRange(my,'Columns',     1,Infinity, 2),
        RSC.BooleanProperty       (my,'evenlySpread',false),
        RSC.StringListProperty    (my,'ColumnStyles',[]),
        RSC.IntegerPropertyInRange(my,'ColumnGap',   0,Infinity, 0),
        RSC.IntegerPropertyInRange(my,'RowGap',      0,Infinity, 0),
        RSC.OneOfProperty         (my,'verticalAlignment',permittedAlignments,'top')
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleNumericAttribute    (Name,newValue, my,'Columns') ||
        RSC.handleBooleanAttribute    (Name,newValue, my,'envenly-spread','evenlySpread') ||
        RSC.handleLiteralListAttribute(Name,newValue, my,'column-styles', 'ColumnStyles') ||
        RSC.handleNumericAttribute    (Name,newValue, my,'column-gap',    'ColumnGap') ||
        RSC.handleNumericAttribute    (Name,newValue, my,'row-gap',       'RowGap') ||
        RSC.handleLiteralAttribute    (Name,newValue, my,'valign',        'verticalAlignment')
      ))

      toRender(() => {
        const {
          Columns:ColumnLimit, evenlySpread, ColumnStyles, ColumnGap, RowGap,
          verticalAlignment
        } = my.observed

        const innerElements = Array.from(my.children)

        const Rows:any[][] = []; let SlotCount = 0, ColumnCount
        if (innerElements.length > 0) {
          Rows.push([]); ColumnCount = 0                            // start new row

          while (innerElements.length > 0) {
            const nextElement = innerElements.shift() as Element
              SlotCount += 1
            nextElement.setAttribute('slot',''+SlotCount) // TODO: very, very poor

            let ColumnStyle = ColumnStyles[ColumnCount] || ColumnStyles[ColumnStyles.length-1]

            if (nextElement.tagName === 'RSC-COLSPAN') {
              let Span = parseInt(nextElement.getAttribute('columns') || '',10)
              if (isNaN(Span)) { Span = 1 } else { Span = Math.max(1,Span) }

              const Width = (
                evenlySpread ? `width:${Math.round(Span*100/ColumnLimit)}%;` : ''
              )

              Rows[Rows.length-1].push(
                html`<td colspan="${Span}" style="${Width}${ColumnStyle}"><slot name="${SlotCount}"/></td>`
              )
              ColumnCount += Span
            } else {
              const Width = (
                evenlySpread ? `width:${Math.round(100/ColumnLimit)}%;` : ''
              )

              Rows[Rows.length-1].push(
                html`<td style="${Width}${ColumnStyle}"><slot name="${SlotCount}"/></td>`
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
              display:block; position:relative;
            }

            #table                       { width:100% }
            #table > tr                  { vertical-align:${verticalAlignment} }
            #table > tr > td             { padding:${Math.round(RowGap/2)}px ${Math.round(ColumnGap/2)}px }
            #table > tr > td:first-child { padding-left:0px }
            #table > tr > td:last-child  { padding-right:0px }

            #table > tr:first-child > td { padding-top:0px }
            #table > tr:last-child  > td { padding-bottom:0px }
          </style>

          <table>
            ${Rows.map((Row) =>  html`<tr>${Row}</tr>`)}
          </table>
        `
      })
    },
    ['Columns','ColumnStyles','ColumnGap','RowGap','valign']
  )

//------------------------------------------------------------------------------
//--                               rsc-colspan                                --
//------------------------------------------------------------------------------

  registerBehaviour('colspan',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      toRender(() => html`
        <style>
          :host {
            display:inline-block; position:relative;
            width:100%; height:100%;
          }
        </style>
        <slot/>
      `)
    }
  )

//------------------------------------------------------------------------------
//--                                 rsc-gap                                  --
//------------------------------------------------------------------------------

  registerBehaviour('gap',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      my.unobserved.Width  = 10
      my.unobserved.Height = 10

      RSC.assign(my.observed,
        RSC.IntegerPropertyInRange(my,'Width', 0,Infinity, 10),
        RSC.IntegerPropertyInRange(my,'Height',0,Infinity, 10),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleNumericAttribute(Name,newValue, my,'Width') ||
        RSC.handleNumericAttribute(Name,newValue, my,'Height')
      ))

      toRender(() => html`
        <div style="width:${my.observed.Width}px; height:${my.observed.Height}px"/>
      `)
    },
    ['width','height']
  )

//------------------------------------------------------------------------------
//--                                 rsc-deck                                 --
//------------------------------------------------------------------------------

  registerBehaviour('deck',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      my.unobserved.activeIndex = 0

      RSC.assign(my.observed,
        RSC.IntegerPropertyInRange(my,'activeIndex', 0,Infinity),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleNumericAttribute(Name,newValue, my,'activeIndex')
      ))

      toRender(() => {
        const innerElements:Element[] = Array.from(my.children)

        const activeIndex = (
          Math.max(0,Math.min(my.observed.activeIndex,innerElements.length-1))
        )

        innerElements.forEach((innerElement,Index) => {
          innerElement.classList.toggle('active',Index === activeIndex)
        }) // TODO: keep external elements unchanged

        return html`
          <style>
            :host { display:inline-block; position:relative }

            ::slotted(rsc-card) { display:none }
            ::slotted(rsc-card.active) {
              display:block; position:absolute;
              left:0px; top:0px; right:0px; bottom:0px;
            }
          </style>
          <slot/>
        `
      })
    },
    ['activeIndex'],
    'rsc-card'
  )

//------------------------------------------------------------------------------
//--                                 rsc-card                                 --
//------------------------------------------------------------------------------

  registerBehaviour('card',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      toRender(() => html`
        <style>
          :host {
            display:block; position:absolute;
            left:0px; top:0px; right:0px; bottom:0px;
          }
        </style>
        <slot/>
      `)
    }
  )

//------------------------------------------------------------------------------
//--                              rsc-tab-strip                               --
//------------------------------------------------------------------------------

  registerBehaviour('tab-strip',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      my.unobserved.activeIndex = 0

      RSC.assign(my.observed,
        RSC.IntegerPropertyInRange(my,'activeIndex', 0,Infinity),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleNumericAttribute(Name,newValue, my,'activeIndex')
      ))

      toRender(() => {
        const innerElements:Element[] = Array.from(my.children)

        const activeIndex = (
          Math.max(0,Math.min(my.observed.activeIndex,innerElements.length-1))
        )

        innerElements.forEach((innerElement,Index) => {
          innerElement.classList.toggle('active',Index === activeIndex)
        }) // TODO: keep external elements unchanged

        function onClick (Event:Event) {
// @ts-ignore 2339 "closest" should exist
          const clickedTab = Event.target.closest('rsc-tab')
          if (! my.contains(clickedTab)) { return }

          my.observed.activeIndex = innerElements.indexOf(clickedTab)
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }

            div {
              display:inline-flex; flex-flow:row nowrap; align-items:stretch;
              position:relative; width:100%; height:100%;
            }

            ::slotted(rsc-tab) {
              display:inline-block; position:relative;
              border:none; border-radius:0px;
              border-bottom:solid 2px transparent;
              margin:2px 10px 2px 10px; padding:0px;
              cursor:pointer;
            }

            ::slotted(rsc-tab:first-child) { margin-left:0px }
            ::slotted(rsc-tab:last-child)  { margin-right:0px }

            ::slotted(rsc-tab.active) {
              border-bottom:solid 2px black;
            }
          </style>
          <div onClick=${onClick}><slot/></div>
        `
      })
    },
    ['Value','activeIndex'],
    'rsc-tab'
  )

//------------------------------------------------------------------------------
//--                                 rsc-tab                                  --
//------------------------------------------------------------------------------

  registerBehaviour('tab',undefined)

//------------------------------------------------------------------------------
//--                               rsc-htmlview                               --
//------------------------------------------------------------------------------

  registerBehaviour('htmlview',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      my.unobserved.Value = ''

      RSC.assign(my.observed,
        RSC.StringProperty(my,'Value',''),
      )

      toRender(() => html`
        <style>
          :host { display:inline-block; position:relative }
        </style>

        <div style="display:inline-block; position:relative; width:100%; height:100%"
          dangerouslySetInnerHTML=${{__html:my.observed.Value}}
        />
      `)
    },
    ['Value']
  )

//------------------------------------------------------------------------------
//--                               rsc-textview                               --
//------------------------------------------------------------------------------

  registerBehaviour('textview',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      my.unobserved.Value = ''

      RSC.assign(my.observed,
        RSC.StringProperty(my,'Value',''),
      )

      toRender(() => html`
        <style>
          :host { display:inline-block; position:relative }
        </style>
        ${my.observed.Value}
      `)
    },
    ['Value']
  )

//------------------------------------------------------------------------------
//--                              rsc-imageview                               --
//------------------------------------------------------------------------------

  registerBehaviour('imageview',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
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

      RSC.assign(my.observed,
        RSC.URLProperty  (my,'Value',''),
        RSC.OneOfProperty(my,'ImageScaling',  RSC_ImageScalings,  'contain'),
        RSC.OneOfProperty(my,'ImageAlignment',RSC_ImageAlignments,'center center'),
      )

      toRender(() => {
        const { Value,ImageScaling,ImageAlignment } = my.observed

        return html`
          <style>
            :host {
              display:inline-block; position:relative;
              font-size:0px; line-height:0px
            }
          </style>

          <img src=${Value} style="
            object-fit:${ImageScaling === 'stretch' ? 'fill ' : ImageScaling};
            object-position:${ImageAlignment};
          "/>
        `
      })
    },
    ['Value','ImageScaling','ImageAlignment']
  )

//------------------------------------------------------------------------------
//--                               rsc-webview                                --
//------------------------------------------------------------------------------

  registerBehaviour('webview',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const DefaultSandboxPermissions = (
        'allow-downloads allow-forms allow-modals allow-orientation-lock ' +
        'allow-pointer-lock allow-popups allow-same-origin allow-scripts'
      )

      const permittedReferrerPolicies = [
        'no-referrer','no-referrer-when-downgrade',
        'origin','origin-when-cross-origin','same-origin',
        'strict-origin','strict-origin-when-cross-origin',
        'unsafe-url'
      ]

      RSC.assign(my.unobserved,{
        Value:'',
        PermissionsPolicy:'', ReferrerPolicy:'',
        SandboxPermissions:DefaultSandboxPermissions, allowsFullscreen:false
      })

      RSC.assign(my.observed,
        RSC.URLProperty    (my,'Value',''),
        RSC.StringProperty (my,'PermissionsPolicy',''),
        RSC.OneOfProperty  (my,'ReferrerPolicy',permittedReferrerPolicies,''),
        RSC.StringProperty (my,'SandboxPermissions',DefaultSandboxPermissions),
        RSC.BooleanProperty(my,'allowsFullscreen',false),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleLiteralAttribute(Name,newValue, my,'Value') ||
        RSC.handleLiteralAttribute(Name,newValue, my,'allow',           'PermissionsPolicy') ||
        RSC.handleLiteralAttribute(Name,newValue, my,'referrer',        'ReferrerPolicy') ||
        RSC.handleLiteralAttribute(Name,newValue, my,'sandbox',         'SandboxPermissions') ||
        RSC.handleBooleanAttribute(Name,newValue, my,'allow-fullscreen','allowsFullscreen')
      ))

      toRender(() => {
        const {
          Value,
          PermissionsPolicy, ReferrerPolicy, SandboxPermissions, allowsFullscreen
        } = my.observed

        return html`
          <style>
            :host { display:inline-block; position:relative }
            iframe {
              display:block; position:relative;
              width:100%; height:100%; overflow:scroll;
            }
          </style>

          <iframe src=${Value} style="
          " allow=${PermissionsPolicy} allowfullscreen=${allowsFullscreen}
            sandbox=${SandboxPermissions} referrerpolicy=${ReferrerPolicy}
          />
        `
      })
    },
    ['Value','PermissionsPolicy','ReferrerPolicy','SandboxPermissions','allowsFullscreen']
  )

//------------------------------------------------------------------------------
//--                                 rsc-icon                                 --
//------------------------------------------------------------------------------

  registerBehaviour('icon',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:'', Color:'black',
      })

      RSC.assign(my.observed,
        RSC.URLProperty  (my,'Value','',     'icon image URL'),
        RSC.ColorProperty(my,'Color','black','icon tint color'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleLiteralAttribute(Name,newValue, my,'Value') ||
        RSC.handleLiteralAttribute(Name,newValue, my,'Color')
      ))

      toRender(() => {
        const { Value, Color } = my.observed

        return html`
          <style>
            :host {
              display:inline-block; position:relative;
              width:24px; height:24px;
              font-size:0px; line-height:0px;
            }
            div {
              display:block; position:absolute;
              left:0px; top:0px; width:100%; height:100%;
              -webkit-mask-image:url(${Value});    mask-image:url(${Value});
              -webkit-mask-size:contain;           mask-size:contain;
              -webkit-mask-position:center center; mask-position:center center;
              background-color:${Color};
            }
          </style>
          <div/>
        `
      })
    },
    ['Value','Color']
  )

//------------------------------------------------------------------------------
//--                            rsc-native-button                             --
//------------------------------------------------------------------------------

  registerBehaviour('native-button',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:'',
        enabled:true,
      })

      RSC.assign(my.observed,
        RSC.BooleanProperty(my,'enabled', true, 'enable setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute  (Name,newValue, my,'Click') ||
        RSC.handleBooleanAttribute(Name,newValue, my,'enabled')
      )) // "Value" will be handled automatically

      toRender(() => {
        function onClick (Event:Event) {
          Event.stopImmediatePropagation()
          trigger('click',[my.observed.value])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
          </style>

          <button disabled=${! my.observed.enabled} onclick=${onClick}>
            ${my.observed.Value}
            <slot/>
          </button>
        `
      })
    },
    ['Value','enabled']
  )

//------------------------------------------------------------------------------
//--                           rsc-native-checkbox                            --
//------------------------------------------------------------------------------

  registerBehaviour('native-checkbox',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:null,    // false, true or null/undefined
        enabled:true,
      })

      RSC.assign(my.observed,
        {
          get Value () { return my.unobserved.Value },
          set Value (newValue) {
            JIL.allowBoolean('checkbox value',newValue)
            my.unobserved.Value = newValue
          }
        },
        RSC.BooleanProperty(my,'enabled', true, 'enable setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute(Name,newValue, my,'Value-Changed') ||
        (function () {
          if (Name === 'value') {
            switch (newValue) {
              case 'true':  my.observed.Value = true;      break
              case 'false': my.observed.Value = false;     break
              default:      my.observed.Value = undefined; break
            }
            return true
          } else { return false }
        })() ||
        RSC.handleBooleanAttribute(Name,newValue, my,'enabled')
      ))

      toRender(() => {
        const isChecked       = (my.observed.Value == true)
        const isIndeterminate = (my.observed.Value == null)

        function onInput (Event:Event) {
// @ts-ignore 2339 allow "checked" access
          my.observed.Value = Event.target.checked

          Event.stopImmediatePropagation() // use "value-changed" instead of "input"
          trigger('value-changed',[my.observed.Value])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
          </style>

          <input type="checkbox" disabled=${! my.observed.enabled}
            checked=${isChecked} indeterminate=${isIndeterminate}
            onInput=${onInput}
          />
        `
      })
    },
    ['Value','enabled']
  )

//------------------------------------------------------------------------------
//--                          rsc-native-radiobutton                          --
//------------------------------------------------------------------------------

  registerBehaviour('native-radiobutton',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:'', Match:'', // redefine "Value" and "Match" for other types
        enabled:true,
      })

      RSC.assign(my.observed,
        RSC.StringProperty (my,'Value', ''),
        RSC.StringProperty (my,'Match', ''),
        RSC.BooleanProperty(my,'enabled', true, 'enable setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute  (Name,newValue, my,'Value-Changed') ||
        RSC.handleBooleanAttribute(Name,newValue, my,'enabled')
      )) // "Value" and "Match" will be handled automatically

      toRender(() => {
        function onInput (Event:Event) {
// @ts-ignore 2339 allow "checked" access
          if (Event.target.checked) {
            my.observed.Value = my.observed.Match

            Event.stopImmediatePropagation() // use "value-changed" instead of "input"
            trigger('value-changed',[my.observed.Value])
          }
        }

        const isChecked = (
          (my.observed.Match !== '') &&
          (my.observed.Value === my.observed.Match)
        )

        return html`
          <style>
            :host { display:inline-block; position:relative }
          </style>

          <input type="radio" disabled=${! my.observed.enabled}
            checked=${isChecked}
            onInput=${onInput}
          />
        `
      })
    },
    ['Value','Match','enabled']
  )

//------------------------------------------------------------------------------
//--                             rsc-native-gauge                             --
//------------------------------------------------------------------------------

  registerBehaviour('native-gauge',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{ // all values are numbers or undefined
        Value:undefined,
        Minimum:0, lowerBound:undefined, Optimum:undefined, upperBound:undefined, Maximum:1,
      }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

      RSC.assign(my.observed,
        RSC.NumberProperty(my,'Value',      null),
        RSC.NumberProperty(my,'Minimum',    0),
        RSC.NumberProperty(my,'lowerBound', null),
        RSC.NumberProperty(my,'Optimum',    null),
        RSC.NumberProperty(my,'upperBound', null),
        RSC.NumberProperty(my,'Maximum',    1),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleNumericAttribute(Name,newValue, my,'Value')      ||
        RSC.handleNumericAttribute(Name,newValue, my,'Minimum')    ||
        RSC.handleNumericAttribute(Name,newValue, my,'lowerBound') ||
        RSC.handleNumericAttribute(Name,newValue, my,'Optimum')    ||
        RSC.handleNumericAttribute(Name,newValue, my,'upperBound') ||
        RSC.handleNumericAttribute(Name,newValue, my,'Maximum')
      ))

      toRender(() => {
        const { Value, Minimum,lowerBound,Optimum,upperBound,Maximum } = my.observed

        return html`
          <style>
            :host { display:inline-block; position:relative }
            meter { width:100% }
          </style>

          <meter value=${isNaN(Value) ? '' : Value}
            min=${Minimum} low=${lowerBound} opt=${Optimum}
            high=${upperBound} max=${Maximum}
          />
        `
      })
    },
    ['Value','Minimum','lowerBound','Optimum','upperBound','Maximum']
  )

//------------------------------------------------------------------------------
//--                          rsc-native-progressbar                          --
//------------------------------------------------------------------------------

  registerBehaviour('native-progressbar',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{ // all values are numbers or undefined
        Value:undefined,
        Maximum:1,
      })

      RSC.assign(my.observed,
        RSC.NumberProperty       (my,'Value',   null),
        RSC.NumberPropertyInRange(my,'Maximum', 0,Infinity, false,false, 1),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleNumericAttribute(Name,newValue, my,'Value')   ||
        RSC.handleNumericAttribute(Name,newValue, my,'Maximum')
      ))

      toRender(() => {
        const { Value,Maximum } = my.observed

        return html`
          <style>
            :host { display:inline-block; position:relative }
            progress { width:100% }
          </style>

          <progress value=${isNaN(Value) ? '' : Value} max=${Maximum} />
        `
      })
    },
    ['Value','Maximum']
  )

//------------------------------------------------------------------------------
//--                            rsc-native-slider                             --
//------------------------------------------------------------------------------

  registerBehaviour('native-slider',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const HashmarkPattern = /^\s*(\d+(?:[.]\d+)?|\d*[.](?:\d*))(?:\s*:\s*([^\x00-\x1F\x7F-\x9F\u2028\u2029\uFFF9-\uFFFB]+))?$/

      RSC.assign(my.unobserved,{ // all values are numbers or undefined
        Value:undefined,
        Minimum:0, Maximum:100, Stepping:1, Hashmarks:[],
        enabled:true,
        UUID:undefined, renderedValue:0 // is used internally - do not touch!
      }) // these are configured(!) values - they may be nonsense (e.g. min. > max.)

      RSC.assign(my.observed,
        RSC.NumberProperty(my,'Value',  0, 'input value'),
        RSC.NumberProperty(my,'Minimum',0, 'minimal input value'),
        RSC.NumberProperty(my,'Maximum',1, 'maximal input value'),
        {
          get Stepping () { return my.unobserved.Stepping },
          set Stepping (newValue) {
            if (newValue !== 'any') {
              JIL.allowNumber('input step value',newValue)
            }
            my.unobserved.Stepping = newValue
          },
        },
        RSC.StringListPropertyMatching(my,'Hashmarks', HashmarkPattern, [], 'hashmarks'),
        RSC.BooleanProperty           (my,'enabled', true, 'enable setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute  (Name,newValue, my,'Value-Changed') ||
        RSC.handleNumericAttribute(Name,newValue, my,'Value')   ||
        RSC.handleNumericAttribute(Name,newValue, my,'Minimum') ||
        RSC.handleNumericAttribute(Name,newValue, my,'Maximum') ||
        (function () {
          if (Name === 'stepping') {
            if (newValue === 'any') {
              my.observed.Stepping = newValue
            } else {
              let parsedValue = parseFloat(newValue)
              if (isNaN(parsedValue)) RSC.throwError(
                'InvalidAttribute: invalid "stepping" value given'
              )
              my.observed.Stepping = parsedValue
            }
            return true
          } else { return false }
        })() ||
        RSC.handleLiteralListAttribute(Name,newValue, my,'Hashmarks') ||
        RSC.handleBooleanAttribute    (Name,newValue, my,'enabled')
      ))

      toRender(() => {
        let { Value, Minimum,Maximum, Stepping, Hashmarks } = my.observed

        if (document.activeElement === me) {
          Value = my.unobserved.renderedValue
        } else {
          my.unobserved.renderedValue = Value
        }

        let DataList, UUID
        if (Hashmarks.length > 0) {
          UUID = my.unobserved.UUID
          if (UUID == null) { UUID = RSC.newUUID() }

          DataList = html`<datalist id=${UUID}>
            ${Hashmarks.map((Item:string) => {
              const Label = Item.replace(/:.*$/,'').trim()
              const Value = Item.replace(/^[^:]+:/,'').trim()

              return html`<option label=${Label} value=${Value}></option>`
            })}
          </datalist>`
        }

        function onInput (Event:Event) {
// @ts-ignore 2339 allow "checked" access
          my.unobserved.renderedValue  = parseFloat(Event.target.value)
          my.observed.Value = my.unobserved.renderedValue

          Event.stopImmediatePropagation() // use "value-changed" instead of "input"
          trigger('value-changed',[my.unobserved.renderedValue])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
            input {
              display:inline-block; position:relative;
              width:100%; height:100%;
              -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
            }
          </style>

          <input type="range" list=${UUID} disabled=${! my.observed.enabled}
            value=${isNaN(Value) ? '' : Value}
            min=${Minimum} max=${Maximum} step=${Stepping}
            onInput=${onInput} onBlur=${my.render.bind(me)}
          />
          ${DataList}
        `
      })
    },
    ['Value','Minimum','Maximum','Stepping','Hashmarks','enabled']
  )

//------------------------------------------------------------------------------
//--                        rsc-native-textline-input                         --
//------------------------------------------------------------------------------

  function registerPlainStringInputBehaviour (
    Name:RSC_Name, Type:string, observedAttributes:RSC_Name[]
  ):void {
    const withSpellChecking = (observedAttributes.indexOf('SpellChecking') >= 0)
    const withSuggestions   = (observedAttributes.indexOf('Suggestions')   >= 0)

    registerBehaviour(Name, function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const permittedSpellCheckValues = ['default','enabled','disabled']

      RSC.assign(my.unobserved,{
        Value:'',
        Size:undefined, minLength:0, maxLength:undefined,
        Pattern:undefined, Placeholder:undefined, readonly:false,
        enabled:true, innerStyle:'',
        UUID:undefined, renderedValue:'' // is used internally - do not touch!
      }, // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)
        (withSpellChecking ? { SpellChecking:'default' } : {}),
        (withSuggestions   ? { Suggestions:[] } : {})
      )

      RSC.assign(my.observed,
        RSC.TextlineProperty      (my,'Value',      '', 'input value'),
        RSC.IntegerPropertyInRange(my,'Size',     1,Infinity, null, 'number of visible characters'),
        RSC.IntegerPropertyInRange(my,'minLength',0,Infinity, null, 'minimal input length'),
        RSC.IntegerPropertyInRange(my,'maxLength',0,Infinity, null, 'maximal input length'),
        RSC.TextlineProperty      (my,'Pattern',    null, 'input pattern'),
        RSC.TextlineProperty      (my,'Placeholder',null, 'input placeholder'),
        RSC.BooleanProperty       (my,'readonly',   false,'read-only setting'),
        RSC.BooleanProperty       (my,'enabled',    true, 'enable setting'),
        RSC.TextProperty          (my,'innerStyle', '',   'inner CSS style setting'),
      )
      if (withSpellChecking) RSC.assign(my.observed,
        RSC.OneOfProperty(my,'SpellChecking',permittedSpellCheckValues,'default','spell-check setting'),
      )
      if (withSuggestions) RSC.assign(my.observed,
        RSC.StringListProperty(my,'Suggestions',[],'list of suggestions'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute  (Name,newValue, my,'Value-Changed') ||
        RSC.handleNumericAttribute(Name,newValue, my,'Size')          ||
        RSC.handleNumericAttribute(Name,newValue, my,'minLength')     ||
        RSC.handleNumericAttribute(Name,newValue, my,'maxLength')     ||
        RSC.handleBooleanAttribute(Name,newValue, my,'readonly')      ||
        (withSuggestions
          ? RSC.handleLiteralLinesAttribute(Name,newValue, my,'Suggestions')
          : false
        ) ||
        RSC.handleBooleanAttribute(Name,newValue, my,'enabled')
      )) // other attributes will be handled automatically

      toRender(() => {
        let {
          Value, Size, minLength,maxLength, Pattern, Placeholder, readonly,
          SpellChecking, Suggestions, innerStyle
        } = my.observed

        if (document.activeElement === me) {
          Value = my.unobserved.renderedValue
        } else {
          my.unobserved.renderedValue = Value
        }

        SpellChecking = (
          SpellChecking === 'default' ? undefined : (SpellChecking === 'enabled')
        )

        let DataList, UUID
        if (withSuggestions && (Suggestions.length > 0)) {
          UUID = my.unobserved.UUID
          if (UUID == null) { UUID = RSC.newUUID() }

          DataList = html`<datalist id=${UUID}>
            ${Suggestions.map((Value:string) => html`<option value=${Value}></option>`)}
          </datalist>`
        }

        function onInput (Event:Event) {
// @ts-ignore 2339 allow "value" access
          my.unobserved.renderedValue = Event.target.value
          my.observed.Value = my.unobserved.renderedValue

          Event.stopImmediatePropagation() // use "value-changed" instead of "input"
          trigger('value-changed',[my.unobserved.renderedValue])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
            input {
              display:inline-block; position:relative;
              width:100%; height:100%;
              -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
            }
          </style>
          <input type=${Type} list=${UUID} disabled=${! my.observed.enabled}
            value=${Value} size=${Size} minlength=${minLength} maxlength=${maxLength}
            pattern=${Pattern} placeholder=${Placeholder}
            ${withSpellChecking ? `spellcheck=${SpellChecking}` : ''}
            readonly=${readonly} style=${innerStyle}
            onInput=${onInput} onBlur=${my.render.bind(me)}
          />
          ${withSuggestions ? DataList : ''}
        `
      })
    }, observedAttributes)
  }

  registerPlainStringInputBehaviour('native-textline-input', 'text', [
    'Value','Size','minLength','maxLength','Pattern','Placeholder','readonly',
    'SpellChecking','Suggestions','enabled','innerStyle'
  ])

//------------------------------------------------------------------------------
//--                        rsc-native-password-input                         --
//------------------------------------------------------------------------------

  registerPlainStringInputBehaviour('native-password-input', 'password', [
    'Value','Size','minLength','maxLength','Pattern','Placeholder','readonly',
    'enabled','innerStyle'
  ])

//------------------------------------------------------------------------------
//--                         rsc-native-number-input                          --
//------------------------------------------------------------------------------

  registerBehaviour('native-number-input',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:NaN,
        Minimum:undefined, Maximum:undefined, Stepping:'any',
        Suggestions:[],
        Placeholder:undefined, readonly:false,
        enabled:true, innerStyle:'',
        UUID:undefined, renderedValue:'' // is used internally - do not touch!
      }) // these are configured(!) values - they may be nonsense (e.g. Minimum > Maximum)

      RSC.assign(my.observed,
        RSC.NumberProperty(my,'Value',  null, 'input value'),
        RSC.NumberProperty(my,'Minimum',null, 'minimal input value'),
        RSC.NumberProperty(my,'Maximum',null, 'maximal input value'),
        {
          get Stepping () { return my.unobserved.Stepping },
          set Stepping (newValue) {
            if (newValue !== 'any') {
              JIL.allowNumber('input step value',newValue)
            }
            my.unobserved.Stepping = newValue
          },
        },
        RSC.TextlineProperty  (my,'Placeholder',null, 'input placeholder'),
        RSC.BooleanProperty   (my,'readonly',   false,'read-only setting'),
        RSC.NumberListProperty(my,'Suggestions',[],   'list of suggestions'),
        RSC.BooleanProperty   (my,'enabled',    true, 'enable setting'),
        RSC.TextProperty      (my,'innerStyle', '',   'inner CSS style setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute  (Name,newValue, my,'Value-Changed') ||
        RSC.handleNumericAttribute(Name,newValue, my,'Value')   ||
        RSC.handleNumericAttribute(Name,newValue, my,'Minimum') ||
        RSC.handleNumericAttribute(Name,newValue, my,'Maximum') ||
        (function () {
          if (Name === 'stepping') {
            if (newValue === 'any') {
              my.observed.Value = newValue
            } else {
              let parsedValue = parseFloat(newValue)
              if (isNaN(parsedValue)) RSC.throwError(
                'InvalidAttribute: invalid "stepping" attribute given'
              )
              my.observed.Value = parsedValue
            }
            return true
          } else { return false }
        })() ||
        RSC.handleBooleanAttribute    (Name,newValue, my,'readonly') ||
        RSC.handleNumericListAttribute(Name,newValue, my,'Suggestions') ||
        RSC.handleBooleanAttribute    (Name,newValue, my,'enabled')
      )) // other attributes will be handled automatically

      toRender(() => {
        let {
          Value, Minimum,Maximum,Stepping, Pattern, Placeholder, readonly,
          Suggestions, innerStyle
        } = my.observed

        if (document.activeElement === me) {
          Value = my.unobserved.renderedValue
        } else {
          my.unobserved.renderedValue = Value
        }

        let DataList, UUID
        if (Suggestions.length > 0) {
          UUID = my.unobserved.UUID
          if (UUID == null) { UUID = RSC.newUUID() }

          DataList = html`<datalist id=${UUID}>
            ${Suggestions.map((Value:string) => html`<option value=${Value}></option>`)}
          </datalist>`
        }

        function onInput (Event:Event) {
// @ts-ignore 2339 allow "value" access
          let newValue = parseFloat(Event.target.value)
//        if (isNaN(newValue)) { newValue = undefined }

          my.observed.Value = my.unobserved.renderedValue = newValue

          Event.stopImmediatePropagation() // use "value-changed" instead of "input"
          trigger('value-changed',[my.unobserved.renderedValue])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
            input {
              display:inline-block; position:relative;
              width:100%; height:100%;
              -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
            }
          </style>
          <input type="text" list=${UUID} disabled=${! my.observed.enabled}
            value=${isNaN(Value) ? '' : Value}
            min=${Minimum} max=${Maximum} step=${Stepping}
            pattern=${Pattern} placeholder=${Placeholder} readonly=${readonly}
            style=${innerStyle}
            onInput=${onInput} onBlur=${my.render.bind(me)}
          />
          ${DataList}
        `
      })
    },
    [
      'Value','Minimum','Maximum','Stepping','Placeholder','readonly',
      'Suggestions','enabled','innerStyle'
    ]
  )

//------------------------------------------------------------------------------
//--                       rsc-native-phonenumber-input                       --
//------------------------------------------------------------------------------

  registerPlainStringInputBehaviour('native-phonenumber-input', 'tel', [
    'Value','Size','minLength','maxLength','Pattern','Placeholder','readonly',
    'Suggestions','enabled','innerStyle'
  ])

//------------------------------------------------------------------------------
//--                      rsc-native-emailaddress-input                       --
//------------------------------------------------------------------------------

  registerBehaviour('native-emailaddress-input',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:[], multiple:false,                      // "Value" is always an array
        Size:undefined, minLength:0, maxLength:undefined,
        Pattern:undefined, Placeholder:undefined, readonly:false,
        Suggestions:[],
        enabled:true, innerStyle:'',
        UUID:undefined, renderedValue:[] // is used internally - do not touch!
      }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

      RSC.assign(my.observed,
        {
          get Value () { return my.unobserved.Value.slice() },
          set Value (newValue) {
            JIL.allowListSatisfying('input value list',newValue, JIL.ValueIsEMailAddress)
            my.unobserved.Value = (newValue == null ? [] : newValue.slice())
          },
        },
        RSC.BooleanProperty       (my,'multiple',   false,'multiplicity setting'),
        RSC.IntegerPropertyInRange(my,'Size',     1,Infinity, null, 'number of visible characters'),
        RSC.IntegerPropertyInRange(my,'minLength',0,Infinity, null, 'minimal input length'),
        RSC.IntegerPropertyInRange(my,'maxLength',0,Infinity, null, 'maximal input length'),
        RSC.TextlineProperty      (my,'Pattern',    null, 'input pattern'),
        RSC.TextlineProperty      (my,'Placeholder',null, 'input placeholder'),
        RSC.BooleanProperty       (my,'readonly',   false,'read-only setting'),
        {
          get Suggestions () { return my.unobserved.Suggestions.slice() },
          set Suggestions (newValue) {
            JIL.allowListSatisfying('list of suggestions',newValue, JIL.ValueIsEMailAddress)
            my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
          },
        },
        RSC.BooleanProperty       (my,'enabled',    true, 'enable setting'),
        RSC.TextProperty          (my,'innerStyle', '',   'inner CSS style setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute       (Name,newValue, my,'Value-Changed') ||
        RSC.handleLiteralListAttribute (Name,newValue, my,'Value')         ||
        RSC.handleBooleanAttribute     (Name,newValue, my,'multiple')      ||
        RSC.handleNumericAttribute     (Name,newValue, my,'Size')          ||
        RSC.handleNumericAttribute     (Name,newValue, my,'minLength')     ||
        RSC.handleNumericAttribute     (Name,newValue, my,'maxLength')     ||
        RSC.handleBooleanAttribute     (Name,newValue, my,'readonly')      ||
        RSC.handleLiteralLinesAttribute(Name,newValue, my,'Suggestions')   ||
        RSC.handleBooleanAttribute     (Name,newValue, my,'enabled')
      )) // other attributes will be handled automatically

      toRender(() => {
        let {
          Value, Size, multiple, minLength,maxLength, Pattern, Placeholder, readonly,
          Suggestions, innerStyle
        } = my.observed

        if (document.activeElement === me) {
          Value = my.unobserved.renderedValue || []
        } else {
          my.unobserved.renderedValue = Value
        }

        let DataList, UUID
        if (Suggestions.length > 0) {
          UUID = my.unobserved.UUID
          if (UUID == null) { UUID = RSC.newUUID() }

          DataList = html`<datalist id=${UUID}>
            ${Suggestions.map((Value:string) => html`<option value=${Value}></option>`)}
          </datalist>`
        }

        function onInput (Event:Event) {
// @ts-ignore 2339 allow "value" access
          my.unobserved.renderedValue = Event.target.value.trim().split(/\s*,\s*/)
          my.observed.Value = my.unobserved.renderedValue

          Event.stopImmediatePropagation() // use "value-changed" instead of "input"
          trigger('value-changed',[my.unobserved.renderedValue])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
            input {
              display:inline-block; position:relative;
              width:100%; height:100%;
              -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
            }
          </style>
          <input type="email" list=${UUID} disabled=${! my.observed.enabled}
            value=${Value.join(',')} size=${Size} minlength=${minLength} maxlength=${maxLength}
            pattern=${Pattern} placeholder=${Placeholder}
            readonly=${readonly} style=${innerStyle}
            onInput=${onInput} onBlur=${my.render.bind(me)}
          />
          ${DataList}
        `
      })
    },
    [
      'Value','Size','multiple','minLength','maxLength','Pattern','Placeholder',
      'readonly','Suggestions','enabled','innerStyle'
    ]
  )

//------------------------------------------------------------------------------
//--                           rsc-native-url-input                           --
//------------------------------------------------------------------------------

  registerBehaviour('native-url-input',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:'',
        Size:undefined, minLength:0, maxLength:undefined,
        Pattern:undefined, Placeholder:undefined, readonly:false,
        Suggestions:[],
        enabled:true, innerStyle:'',
        UUID:undefined, renderedValue:'' // is used internally - do not touch!
      }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

      RSC.assign(my.observed,
        RSC.URLProperty           (my,'Value',      '', 'input value'),
        RSC.IntegerPropertyInRange(my,'Size',     1,Infinity, null, 'number of visible characters'),
        RSC.IntegerPropertyInRange(my,'minLength',0,Infinity, null, 'minimal input length'),
        RSC.IntegerPropertyInRange(my,'maxLength',0,Infinity, null, 'maximal input length'),
        RSC.TextlineProperty      (my,'Pattern',    null, 'input pattern'),
        RSC.TextlineProperty      (my,'Placeholder',null, 'input placeholder'),
        RSC.BooleanProperty       (my,'readonly',   false,'read-only setting'),
        RSC.StringListProperty    (my,'Suggestions',[],   'list of suggestions'),
        RSC.BooleanProperty       (my,'enabled',    true, 'enable setting'),
        RSC.TextProperty          (my,'innerStyle', '',   'inner CSS style setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute       (Name,newValue, my,'Value-Changed') ||
        RSC.handleNumericAttribute     (Name,newValue, my,'Size')          ||
        RSC.handleNumericAttribute     (Name,newValue, my,'minLength')     ||
        RSC.handleNumericAttribute     (Name,newValue, my,'maxLength')     ||
        RSC.handleBooleanAttribute     (Name,newValue, my,'readonly')      ||
        RSC.handleLiteralLinesAttribute(Name,newValue, my,'Suggestions')   ||
        RSC.handleBooleanAttribute     (Name,newValue, my,'enabled')
      )) // other attributes will be handled automatically

      toRender(() => {
        let {
          Value, Size, minLength,maxLength, Pattern, Placeholder, readonly,
          Suggestions, innerStyle
        } = my.observed

        if (document.activeElement === me) {
          Value = my.unobserved.renderedValue
        } else {
          my.unobserved.renderedValue = Value
        }

        let DataList, UUID
        if (Suggestions.length > 0) {
          UUID = my.unobserved.UUID
          if (UUID == null) { UUID = RSC.newUUID() }

          DataList = html`<datalist id=${UUID}>
            ${Suggestions.map((Value:string) => html`<option value=${Value}></option>`)}
          </datalist>`
        }

        function onInput (Event:Event) {
// @ts-ignore 2339 allow "value" access
          my.unobserved.renderedValue = Event.target.value
          my.observed.Value = my.unobserved.renderedValue

          Event.stopImmediatePropagation() // use "value-changed" instead of "input"
          trigger('value-changed',[my.unobserved.renderedValue])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
            input {
              display:inline-block; position:relative;
              width:100%; height:100%;
              -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
            }
          </style>
          <input type="url" list=${UUID} disabled=${! my.observed.enabled}
            value=${Value} size=${Size} minlength=${minLength} maxlength=${maxLength}
            pattern=${Pattern} placeholder=${Placeholder}
            readonly=${readonly} style=${innerStyle}
            onInput=${onInput} onBlur=${my.render.bind(me)}
          />
          ${DataList}
        `
      })
    },
    [
      'Value','Size','minLength','maxLength','Pattern','Placeholder','readonly',
      'Suggestions','enabled','innerStyle'
    ]
  )

//------------------------------------------------------------------------------
//--                          rsc-native-time-input                           --
//------------------------------------------------------------------------------

  function registerCalendarInputBehaviour (
    Name:RSC_Name, Type:string, CalendarPattern:string, CalendarRegExp:RegExp
  ):void {
    registerBehaviour('native-time-input',
      function (
        my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
        onAttributeChange:RSC_onAttributeChange,
        onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
        toRender:(Callback:() => any) => void, html:Function,
        on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
        reactively:(reactiveFunction:Function) => void,
        ShadowRoot:any
      ) {
        function CalendarMatcher (Value:string):boolean {
          return JIL.ValueIsStringMatching(Value,CalendarRegExp)
        }

        RSC.assign(my.unobserved,{
          Value:'',
          Minimum:undefined, Maximum:undefined, Stepping:60,
          Placeholder:undefined, readonly:false,
          Suggestions:[],
          enabled:true, innerStyle:'',
          UUID:undefined, renderedValue:'' // is used internally - do not touch!
        }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

        RSC.assign(my.observed,
          {
            get Value () { return my.unobserved.Value },
            set Value (newValue) {
              JIL.allowStringMatching('input value',newValue,CalendarRegExp)
              my.unobserved.Value = newValue
            },

            get Minimum () { return my.unobserved.Minimum },
            set Minimum (newValue) {
              JIL.allowStringMatching('minimal input value',newValue,CalendarRegExp)
              my.unobserved.Minimum = newValue
            },

            get Maximum () { return my.unobserved.Maximum },
            set Maximum (newValue) {
              JIL.allowStringMatching('maximal input value',newValue,CalendarRegExp)
              my.unobserved.Maximum = newValue
            },
          },
          {
            get Stepping () { return my.unobserved.Stepping },
            set Stepping (newValue) {
              if (newValue !== 'any') {
                JIL.allowNumber('input step value',newValue)
              }
              my.unobserved.Stepping = newValue || 60
            },
          },
          RSC.TextlineProperty(my,'Placeholder',null, 'input placeholder'),
          RSC.BooleanProperty (my,'readonly',   false,'read-only setting'),
          {
            get Suggestions () { return my.unobserved.Suggestions.slice() },
            set Suggestions (newValue) {
              JIL.allowListSatisfying('list of suggestions',newValue, CalendarMatcher)
              my.unobserved.Suggestions = (newValue == null ? [] : newValue.slice())
            },
          },
          RSC.BooleanProperty (my,'enabled',    true, 'enable setting'),
          RSC.TextProperty    (my,'innerStyle', '',   'inner CSS style setting'),
        )

        onAttributeChange((Name, newValue) => (
          RSC.handleEventAttribute(Name,newValue, my,'Value-Changed') ||
          (function () {
            if (Name === 'stepping') {
              if (newValue === 'any') {
                my.observed.Value = newValue
              } else {
                let parsedValue = parseInt(newValue,10)
                if (isNaN(parsedValue)) RSC.throwError(
                  'InvalidAttribute: invalid "stepping" attribute given'
                )
                my.observed.Value = parsedValue
              }
              return true
            } else { return false }
          })() ||
          RSC.handleBooleanAttribute    (Name,newValue, my,'readonly')    ||
          RSC.handleLiteralListAttribute(Name,newValue, my,'Suggestions') ||
          RSC.handleBooleanAttribute    (Name,newValue, my,'enabled')
        )) // other attributes will be handled automatically

        toRender(() => {
          let {
            Value, Minimum,Maximum, Stepping, Placeholder, readonly,
            Suggestions, innerStyle
          } = my.observed

          if (document.activeElement === me) {
            Value = my.unobserved.renderedValue
          } else {
            my.unobserved.renderedValue = Value
          }

          let DataList, UUID
          if (Suggestions.length > 0) {
            UUID = my.unobserved.UUID
            if (UUID == null) { UUID = RSC.newUUID() }

            DataList = html`<datalist id=${UUID}>
              ${Suggestions.map((Value:string) => html`<option value=${Value}></option>`)}
            </datalist>`
          }

          function onInput (Event:Event) {
  // @ts-ignore 2339 allow "value" access
            my.unobserved.renderedValue = Event.target.value
            my.observed.Value = my.unobserved.renderedValue

            Event.stopImmediatePropagation() // use "value-changed" instead of "input"
            trigger('value-changed',[my.unobserved.renderedValue])
          }

          return html`
            <style>
              :host { display:inline-block; position:relative }
              input {
                display:inline-block; position:relative;
                width:100%; height:100%;
                -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
              }
            </style>

            <input type="time" list=${UUID} disabled=${! my.observed.enabled}
              value=${Value} min=${Minimum} max=${Maximum} step=${Stepping}
              pattern=${CalendarPattern} placeholder=${Placeholder} readonly=${readonly}
              style=${innerStyle}
              onInput=${onInput} onBlur=${my.render.bind(me)}
            />
            ${DataList}
          `
        })
      },
      [
        'Value','Minimum','Maximum','Stepping','Placeholder','readonly',
        'Suggestions','enabled','innerStyle'
      ]
    )
  }

  registerCalendarInputBehaviour('native-time-input', 'time',
    '\\d{2}:\\d{2}', /\d{2}:\d{2}/
  )


//------------------------------------------------------------------------------
//--                        rsc-native-datetime-input                         --
//------------------------------------------------------------------------------

  registerCalendarInputBehaviour('native-datetime-input', 'datetime-local',
    '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}', /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/
  )

//------------------------------------------------------------------------------
//--                          rsc-native-date-input                           --
//------------------------------------------------------------------------------

  registerCalendarInputBehaviour('native-date-input', 'date',
    '\\d{4}-\\d{2}-\\d{2}', /\d{4}-\d{2}-\d{2}/
  )

//------------------------------------------------------------------------------
//--                          rsc-native-week-input                           --
//------------------------------------------------------------------------------

  registerCalendarInputBehaviour('native-week-input', 'week',
    '\\d{4}-W\\d{2}', /\d{4}-W\d{2}/
  )

//------------------------------------------------------------------------------
//--                          rsc-native-month-input                          --
//------------------------------------------------------------------------------

  registerCalendarInputBehaviour('native-month-input', 'month',
    '\\d{4}-\\d{2}', /\d{4}-\d{2}/
  )

//------------------------------------------------------------------------------
//--                         rsc-native-search-input                          --
//------------------------------------------------------------------------------

  registerPlainStringInputBehaviour('native-search-input', 'search', [
    'Value','Size','minLength','maxLength','Pattern','Placeholder','readonly',
    'SpellChecking','Suggestions','enabled','innerStyle'
  ])

//------------------------------------------------------------------------------
//--                          rsc-native-color-input                          --
//------------------------------------------------------------------------------

  registerBehaviour('native-color-input',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:'',
        Suggestions:[],
        enabled:true, innerStyle:'',
        UUID:undefined, renderedValue:'' // is used internally - do not touch!
      })

      RSC.assign(my.observed,
        {
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
        },
        RSC.BooleanProperty(my,'enabled',    true, 'enable setting'),
        RSC.TextProperty   (my,'innerStyle', '',   'inner CSS style setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute      (Name,newValue, my,'Value-Changed') ||
        RSC.handleLiteralListAttribute(Name,newValue, my,'Suggestions') ||
        RSC.handleBooleanAttribute    (Name,newValue, my,'enabled')
      )) // other attributes will be handled automatically

      toRender(() => {
        let { Value, Suggestions, innerStyle } = my.observed

        if (document.activeElement === me) {
          Value = my.unobserved.renderedValue
        } else {
          my.unobserved.renderedValue = Value
        }

        let DataList, UUID
        if (Suggestions.length > 0) {
          UUID = my.unobserved.UUID
          if (UUID == null) { UUID = RSC.newUUID() }

          DataList = html`<datalist id=${UUID}>
            ${Suggestions.map((Value:string) => html`<option value=${Value}></option>`)}
          </datalist>`
        }

        function onInput (Event:Event) {
// @ts-ignore 2339 allow "checked" access
          my.unobserved.renderedValue = Event.target.value
          my.observed.Value = my.unobserved.renderedValue

          Event.stopImmediatePropagation() // use "value-changed" instead of "input"
          trigger('value-changed',[my.unobserved.renderedValue])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
            input {
              display:inline-block; position:relative;
              /* width:100%; height:100%; */
              -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
            }
          </style>
          <input type="color" list=${UUID} disabled=${! my.observed.enabled}
            value=${Value} style=${innerStyle}
            onInput=${onInput} onBlur=${my.render.bind(me)}
          />
          ${DataList}
        `
      })
    },
    ['Value','Suggestions','enabled','innerStyle']
  )

//------------------------------------------------------------------------------
//--                           rsc-native-dropdown                            --
//------------------------------------------------------------------------------

  registerBehaviour('native-dropdown',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:[], multiple:false, Options:[],          // "Value" is always an array
        Size:undefined,
        enabled:true,
        UUID:undefined, renderedValue:'' // is used internally - do not touch!
      }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

      RSC.assign(my.observed,
        {
          get Value () {
            const { Value,multiple,Options } = my.unobserved
            const ValueList = Value.filter((Item:any) => Options.indexOf(Item) >= 0)
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
        },
        RSC.BooleanProperty       (my,'multiple',false,'multiplicity setting'),
        RSC.IntegerPropertyInRange(my,'Size',    1,Infinity, null, 'number of visible characters'),
        RSC.StringListProperty    (my,'Options', [],   'list of options'),
        RSC.BooleanProperty       (my,'enabled', true, 'enable setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute       (Name,newValue, my,'Value-Changed') ||
        RSC.handleLiteralListAttribute (Name,newValue, my,'Value')    ||
        RSC.handleBooleanAttribute     (Name,newValue, my,'multiple') ||
        RSC.handleLiteralLinesAttribute(Name,newValue, my,'Options')  ||
        RSC.handleNumericAttribute     (Name,newValue, my,'Size')     ||
        RSC.handleBooleanAttribute     (Name,newValue, my,'enabled')
      )) // other attributes will be handled automatically

      toRender(() => {
        let { Value, Size } = my.unobserved        // "Value" is always an array

        if (document.activeElement === me) {
          Value = my.unobserved.renderedValue
        } else {
          my.unobserved.renderedValue = Value
        }

        const ValueSet = Object.create(null)
          Value.forEach((Value:any) => ValueSet[Value] = true )

        let { multiple, Options } = my.observed

        let OptionList = Options.map((Option:string) => {
          const Label = Option.replace(/:.*$/,'').trim()// works even for options...
          const Value = Option.replace(/^\s*[^:]+:/,'').trim()  // ...without colon!
          return { Label,Value }
        })

        function onInput (Event:Event) {
// @ts-ignore 2339 allow "checked" access
          my.unobserved.renderedValue = Array.from(Event.target.options)
            .filter((Option:any) => Option.selected)
            .map((Option:any) => Option.value)
          my.observed.Value = my.unobserved.renderedValue

          Event.stopImmediatePropagation() // use "value-changed" instead of "input"
          trigger('value-changed',[my.unobserved.renderedValue])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
            select {
              display:inline-block; position:relative;
              width:100%; height:100%;
              -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
            }
          </style>
          <select disabled=${! my.observed.enabled} size=${Size}
            onInput=${onInput} onBlur=${my.render.bind(me)}
          >
            ${OptionList.map(({ Label,Value }:{ Label:string,Value:string }) => {
              return html`<option value=${Value} selected=${Value in ValueSet}>${Label}</option>`
            })}
          </>
        `
      })
    },
    ['Value','Size','multiple','Options','enabled']
  )

//------------------------------------------------------------------------------
//--                          rsc-native-text-input                           --
//------------------------------------------------------------------------------

  registerBehaviour('native-text-input',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const permittedSpellCheckValues = ['default','enabled','disabled']

      RSC.assign(my.unobserved,{
        Value:'',
        LineWrapping:true, Rows:undefined, resizable:false,
        minLength:0, maxLength:undefined,
        Pattern:undefined, Placeholder:undefined, readonly:false,
        SpellChecking:'default',
        enabled:true, innerStyle:'',
        UUID:undefined, renderedValue:'' // is used internally - do not touch!
      }) // these are configured(!) values - they may be nonsense (e.g. minLength > maxLength)

      RSC.assign(my.observed,
        RSC.TextProperty          (my,'Value',       '', 'input value'),
        RSC.BooleanProperty       (my,'LineWrapping',true, 'line wrapping'),
        RSC.IntegerPropertyInRange(my,'Rows',     1,Infinity, null, 'number of visible rows'),
        RSC.BooleanProperty       (my,'resizable',   true, 'resizability wrapping'),
        RSC.IntegerPropertyInRange(my,'minLength',0,Infinity, null, 'minimal input length'),
        RSC.IntegerPropertyInRange(my,'maxLength',0,Infinity, null, 'maximal input length'),
        RSC.TextlineProperty      (my,'Pattern',    null, 'input pattern'),
        RSC.TextlineProperty      (my,'Placeholder',null, 'input placeholder'),
        RSC.BooleanProperty       (my,'readonly',   false,'read-only setting'),
        RSC.OneOfProperty         (my,'SpellChecking',permittedSpellCheckValues,'default','spell-check setting'),
        RSC.BooleanProperty       (my,'enabled',    true, 'enable setting'),
        RSC.TextProperty          (my,'innerStyle', '',   'inner CSS style setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute  (Name,newValue, my,'Value-Changed') ||
        RSC.handleBooleanAttribute(Name,newValue, my,'LineWrapping')  ||
        RSC.handleNumericAttribute(Name,newValue, my,'Rows')          ||
        RSC.handleBooleanAttribute(Name,newValue, my,'resizable')     ||
        RSC.handleNumericAttribute(Name,newValue, my,'minLength')     ||
        RSC.handleNumericAttribute(Name,newValue, my,'maxLength')     ||
        RSC.handleBooleanAttribute(Name,newValue, my,'readonly')      ||
        RSC.handleBooleanAttribute(Name,newValue, my,'enabled')
      )) // other attributes will be handled automatically

      toRender(() => {
        let {
          Value, LineWrapping, Rows, resizable, minLength,maxLength,
          Placeholder, readonly, SpellChecking, innerStyle
        } = my.observed

        if (document.activeElement === me) {
          Value = my.unobserved.renderedValue
        } else {
          my.unobserved.renderedValue = Value
        }

        SpellChecking = (
          SpellChecking === 'default' ? undefined : (SpellChecking === 'enabled')
        )

        const Style = (resizable ? 'resize:both' : 'resize:none') + '; ' + innerStyle

        function onInput (Event:Event) {
// @ts-ignore 2339 allow "checked" access
          my.unobserved.renderedValue = Event.target.value
          my.observed.Value = my.unobserved.renderedValue

          Event.stopImmediatePropagation() // use "value-changed" instead of "input"
          trigger('value-changed',[my.unobserved.renderedValue])
        }

        return html`
          <style>
            :host { display:inline-block; position:relative }
            textarea {
              display:inline-block; position:relative;
              width:100%; height:100%;
              ${LineWrapping ? '' : 'white-space:pre'};
              -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
            }
          </style>
          <textarea disabled=${! my.observed.enabled} style=${Style}
            readonly=${readonly} rows=${Rows} wrap=${LineWrapping ? 'hard' : 'soft'}
            minlength=${minLength} maxlength=${maxLength}
            placeholder=${Placeholder} spellcheck=${SpellChecking} style=${innerStyle}
            onInput=${onInput} onBlur=${my.render.bind(me)}
          >${Value}</>
        `
      })
    },
    [
      'Value','LineWrapping','Rows','resizable','minLength','maxLength',
      'Placeholder','readonly','SpellChecking','enabled','innerStyle'
    ]
  )

//------------------------------------------------------------------------------
//--                            rsc-file-drop-area                            --
//------------------------------------------------------------------------------

  registerBehaviour('file-drop-area',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      RSC.assign(my.unobserved,{
        Value:[], multiple:false, FileInfoList:[],     // "Value" is always an array
        acceptableFileTypes:'',
      })

      RSC.assign(my.observed,
        RSC.StringListProperty(my,'Value',               [],    'list of chosen files'),
        {
          get FileInfoList () { return my.unobserved.FileInfoList.map((Info:Indexable) => ({...Info})) },
          set FileInfoList (newValue) {
            JIL.allowListSatisfying('FileInfoList value',newValue, (Value:any) => {
              (Value == null) || (
                (typeof Value === 'object') &&
                JIL.ValueIsString(Value.name)  && JIL.ValueIsString(Value.type) &&
                JIL.ValueIsOrdinal(Value.size) && JIL.ValueIsOrdinal(Value.lastModified)
              )
            })
            my.unobserved.FileInfoList = (newValue || []).map((FileInfo:Indexable) => {
              let { name,type,size,lastModified } = FileInfo
              return { Name:name, Type:type, Size:size, lastModified }
            })
          }
        },
        RSC.BooleanProperty   (my,'multiple',            false, 'multiplicity setting'),
        RSC.TextlineProperty  (my,'acceptableFileTypes', '',    'acceptable file types'),
        RSC.BooleanProperty   (my,'enabled',             true,  'enable setting'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute  (Name,newValue, my,'Value-Changed')    ||
        RSC.handleEventAttribute  (Name,newValue, my,'Choice-Cancelled') ||
        RSC.ignoreAttribute       (Name,newValue, my,'Value')            ||
        RSC.handleLiteralAttribute(Name,newValue, my,'accept','acceptableFileTypes') ||
        RSC.handleBooleanAttribute(Name,newValue, my,'multiple')         ||
        RSC.ignoreAttribute       (Name,newValue, my,'FileInfoList')     ||
        RSC.handleBooleanAttribute(Name,newValue, my,'enabled')
      )) // other attributes will be handled automatically

      toRender(() => {
        let { multiple, acceptableFileTypes } = my.observed

        function acceptableFilesIn (chosenFiles:Indexable[]) {
          const acceptableSuffixes = acceptableFileTypes.split(',')
            .filter((Suffix:string) => Suffix.indexOf('/') < 0)
            .map((Suffix:string) => Suffix.trim())
          return chosenFiles.filter((File) => (
            acceptableSuffixes.some((Suffix:string) => File.name.endsWith(Suffix))
          ))
        }

        function onChange (Event:Event) {
          Event.stopImmediatePropagation() // use "value-changed" instead of "change"

// @ts-ignore 2339 allow "files" access
          const chosenFiles = acceptableFilesIn(Array.from(Event.target.files))
    //    if (chosenFiles.length === 0) { return }      // no, deliver an empty list

          my.observed.Value        = chosenFiles.map((FileInfo) => FileInfo.name)
          my.observed.FileInfoList = chosenFiles.slice()

          trigger('value-changed',[chosenFiles.map((FileInfo) => FileInfo.name)])
        }

        function onCancel (Event:Event) {
          Event.stopImmediatePropagation()
          trigger('choice-canceled')
        }

        function onDragOver (Event:Event) {
          Event.preventDefault()

// @ts-ignore 2339 allow "files" access
          const acceptableFiles = acceptableFilesIn(Array.from(Event.target.files))
// @ts-ignore 2339 allow "datatransfer" access
          if (acceptableFiles.length === 0) { Event.dataTransfer.dropEffect = 'none' }
        }

        function onDrop (DropEvent:Event) {
          DropEvent.preventDefault()
          DropEvent.stopImmediatePropagation()

          let FileInputControl = ShadowRoot.getElementById('FileInputControl')
// @ts-ignore 2339 allow "datatransfer" access
          FileInputControl.files = DropEvent.dataTransfer.files
          FileInputControl.dispatchEvent(new Event('change'))
        }

        return html`
          <style>
            :host {
              display:inline-block; position:relative;
              width:260px; height:100px; min-width:260px; min-height:100px;
              border:dashed 4px lightgray; border-radius:10px;
              color:lightgray; text-align:center;
            }
            input {
              display:inline-block; position:relative;
              width:100%; height:100%;
              -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;
            }
          </style>

          <div style="
            display:inline-block; position:absolute;
            left:50%; top:50%;
            transform:translate(-50%,-55%);
            white-space:nowrap;
          ">
            <div style="font-size:22px">Drop File here</div>
            <div style="font-size:14px">(or click/tap and select file manually)</div>
          </div>
          <input type="file" id="FileInputControl" style="
            display:block; position:absolute;
            left:0px; top:0px; width:100%; height:100%;
            opacity:0;
          "
            multiple=${multiple} accept=${acceptableFileTypes}
            onChange=${onChange} onCancel=${onCancel}
            onDragOver=${onDragOver} onDrop=${onDrop}
          />
        `
      })
    },
    ['Value','multiple','accept','FileInfoList','enabled']
  )

//------------------------------------------------------------------------------
//--                              rsc-scrollpane                              --
//------------------------------------------------------------------------------

  registerBehaviour('scrollpane',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const permittedScrollDirections = ['none','horizontal','vertical','both']

      my.unobserved.ScrollDirection = 'both'

      RSC.assign(my.observed,
        RSC.OneOfProperty(my,'ScrollDirection',permittedScrollDirections,'both'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleSettingOrKeywordAttribute(Name,newValue, my,'ScrollDirection', permittedScrollDirections)
      ))

      toRender(() => {
        let { ScrollDirection } = my.observed

        const OverflowX = ((ScrollDirection === 'horizontal') || (ScrollDirection === 'both') ? 'scroll' : 'hidden')
        const OverflowY = ((ScrollDirection === 'vertical')   || (ScrollDirection === 'both') ? 'scroll' : 'hidden')

        const Overflow = (OverflowX === OverflowY ? OverflowX : OverflowX + ' ' + OverflowY)

        return html`
          <style>
            :host {
              display:inline-block; position:relative;
              overflow:${Overflow}; overflow-x:${OverflowX}; overflow-y:${OverflowY};
            }
          </style>
          <slot/>
        `
      })
    },
    ['ScrollDirection']
  )

//------------------------------------------------------------------------------
//--                            rsc-flat-list-view                            --
//------------------------------------------------------------------------------

  registerBehaviour('flat-list-view',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const DefaultItemRenderer = 'return Item'
      const DefaultItemStyling  = `
        div {
          display:block; position:relative; overflow:hidden;
          height:22px; line-height:22px; padding:0px 0px 0px 4px;
          border:none; border-bottom:solid 1px lightgray;
          background:none;
          white-space:nowrap; text-overflow:ellipsis;
        }
        div:last-child { border:none; border-bottom:solid 1px transparent }
        div.selected   { background:dodgerblue; color:white }
      `
      const DefaultItemSelector = ''                // i.e., uses built-in selection

      RSC.assign(my.unobserved,{
        Value:[], Placeholder:'(empty list)',
        selectedIndices:[], SelectionLimit:1,
        ItemRenderer:DefaultItemRenderer, ItemStyling:DefaultItemStyling,
        ItemSelector:DefaultItemSelector
      })

      RSC.assign(my.observed,
        RSC.ListProperty              (my,'Value',           [],                  'item list'),
        RSC.TextProperty              (my,'Placeholder',     '(empty list)',      'placeholder'),
        RSC.IntegerListPropertyInRange(my,'selectedIndices', 0,Infinity, [],      'list of selected item indices'),
        RSC.IntegerPropertyInRange    (my,'SelectionLimit',  0,Infinity, 1,       'max. number of selected items'),
        RSC.TextProperty              (my,'ItemRenderer',    DefaultItemRenderer, 'item renderer code'),
        RSC.TextProperty              (my,'ItemStyling',     DefaultItemStyling,  'item styling'),
        RSC.TextProperty              (my,'ItemSelector',    DefaultItemSelector, 'item selector code'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute  (Name,newValue, my,'item-clicked')    ||
        RSC.handleEventAttribute  (Name,newValue, my,'item-selected')   ||
        RSC.handleEventAttribute  (Name,newValue, my,'item-deselected') ||
        RSC.handleNumericAttribute(Name,newValue, my,'selectedIndices') ||
        RSC.handleNumericAttribute(Name,newValue, my,'SelectionLimit')
      )) // other attributes will be handled automatically

      toRender(() => {
        let Value = my.observed.Value
        const {
          Placeholder, selectedIndices,SelectionLimit,
          ItemRenderer,ItemStyling,ItemSelector
        } = my.observed

        if (selectedIndices.length > SelectionLimit) {
          my.observed.selectedIndices = selectedIndices.slice(0,SelectionLimit)
          return                      // "toRender" will be called again in a moment
        }

        function ItemIsSelected (Index:number):boolean {
          return (selectedIndices.indexOf(Index) >= 0)
        }

        let compiledRenderer:Function
        try {
          compiledRenderer = new Function('my,Item,Index,ItemIsSelected',ItemRenderer)
        } catch (Signal) {
          RSC.throwError('"ItemRenderer" compilation error: ' + Signal)
        }

        let renderedItems = []
        try {
          if (! Array.isArray(Value)) { Value = [] }

          renderedItems = Value.map((Item:any,Index:number) => {
            let renderedItem = compiledRenderer(my,Item,Index, ItemIsSelected(Index))
            if (! JIL.ValueIsText(renderedItem)) JIL.throwError(
              'Item Rendering Failure: rendering of item #' + Index + ' did not ' +
              'produce proper HTML code'
            )
            return renderedItem
          })
        } catch (Signal) {
          RSC.throwError('"ItemRenderer" or "ItemIsSelected" execution error: ' + Signal)
        }

        let compiledSelector:Function
        if (ItemSelector.trim() !== '') try {
          compiledRenderer = new Function('my,Item,Index,ItemIsSelected',ItemSelector)
        } catch (Signal) {
          RSC.throwError('"ItemSelector" compilation error: ' + Signal)
        }

        function onClick (Event:Event) {
          Event.stopImmediatePropagation()
          Event.preventDefault()

// @ts-ignore 2339 allow "getAttribute" access
          const ItemIndex = parseInt(Event.currentTarget.getAttribute('id'),10)
          if (isNaN(ItemIndex)) { return }                        // just in case...

          if (compiledSelector == null) {
            if (SelectionLimit === 0) { return }

            let selectedItemIndex, deselectedItemIndex
            const SelectionIndex = selectedIndices.indexOf(ItemIndex)
            if (SelectionIndex < 0) {
              if (selectedIndices.length === SelectionLimit) {
                deselectedItemIndex = selectedIndices.shift()
              }
              selectedIndices.push(selectedItemIndex = ItemIndex)
            } else {
              deselectedItemIndex = selectedIndices.splice(SelectionIndex,1)[0]
            }
            my.observed.selectedIndices = selectedIndices

            if (deselectedItemIndex != null) { trigger('item-deselected',[deselectedItemIndex, Value[deselectedItemIndex]]) }
            if (selectedItemIndex   != null) { trigger('item-selected',  [selectedItemIndex,   Value[selectedItemIndex]]) }
          } else {
            try {
              ItemSelector(my,ItemIndex, Value,selectedIndices,SelectionLimit)
            } catch (Signal) {
              RSC.throwError('"ItemSelector" execution error: ' + Signal)
            }
          }

          trigger('item-clicked',[ItemIndex, Value[ItemIndex]])
        }

        return html`
          <style>
            :host {
              display:inline-block; position:relative;
              left:0px; top:0px; width:100%; height:100%;
              overflow:auto scroll; overflow-x:auto; overflow-y:scroll;
            }

            :host > div {
              display:block; position:relative;
            }

            ${ItemStyling}
          </style>

          ${renderedItems.length === 0
          ? html`<rsc-centered>${Placeholder}</rsc-centered>`
          : renderedItems.map((renderedItem:any,Index:number) => html`
              <div id=${Index} class=${ItemIsSelected(Index) ? 'selected' : undefined}
                dangerouslySetInnerHTML=${{__html:renderedItem}}
                onClick=${onClick}
              />
            `)
          }
        `
      })
    },
    ['Value','Placeholder','selectedIndices','SelectionLimit','ItemRenderer','ItemStyling','ItemSelector']
  )

//------------------------------------------------------------------------------
//--                           rsc-nested-list-view                           --
//------------------------------------------------------------------------------

  registerBehaviour('nested-list-view',
    function (
      my:RSC_Visual,me:RSC_Visual, RSC:Indexable,JIL:Indexable,
      onAttributeChange:RSC_onAttributeChange,
      onAttachment:RSC_onAttachment, onDetachment:RSC_onDetachment,
      toRender:(Callback:() => any) => void, html:Function,
      on:RSC_on, once:RSC_once, off:RSC_off, trigger:RSC_trigger,
      reactively:(reactiveFunction:Function) => void,
      ShadowRoot:any
    ) {
      const DefaultItemStyling  = `
        div {
          display:block; position:relative; overflow:hidden;
          height:22px; line-height:22px; padding:0px 0px 0px 4px;
          border:none; border-bottom:solid 1px lightgray;
          background:none;
          white-space:nowrap; text-overflow:ellipsis;
        }
        div:last-child { border:none; border-bottom:solid 1px transparent }
        div.selected   { background:dodgerblue; color:white }
        div > img      { width:10px; height:10px }
      `

      RSC.assign(my.unobserved,{
        Value:[], Placeholder:'(empty list)',
        selectedPaths:[], SelectionLimit:1, SelectionMode:'same-container',
        expandedPaths:[], Indentation:10,
        ItemLabel:'', ItemContentList:'',
        ItemRenderer:'', ItemStyling:DefaultItemStyling,
        ItemSelector:'', ItemExpander:'',
      })

      function ValueIsIndexPath (Value:any):boolean {
        return JIL.ValueIsListSatisfying(Value,JIL.ValueIsOrdinal)
      }

      RSC.assign(my.observed,
        RSC.ListProperty          (my,'Value',           [],                 'item list'),
        RSC.TextProperty          (my,'Placeholder',     '(empty list)',     'placeholder'),
        RSC.ListPropertySatisfying(my,'selectedPaths', ValueIsIndexPath, [], 'list of selected item paths'),
        RSC.IntegerPropertyInRange(my,'SelectionLimit',  0,Infinity, 1,      'max. number of selected items'),
        RSC.OneOfProperty         (my,'SelectionMode',   ['any-container','same-container'], 'same-container', 'selection mode'),
        RSC.IntegerPropertyInRange(my,'Indentation',     0,Infinity, 10,     'sublist indentation'),
        RSC.ListPropertySatisfying(my,'expandedPaths', ValueIsIndexPath, [], 'list of expanded item paths'),
        RSC.TextProperty          (my,'ItemLabel',       '',                 'item label retrieval code'),
        RSC.TextProperty          (my,'ItemContentList', '',                 'item content list retrieval code'),
        RSC.TextProperty          (my,'ItemRenderer',    '',                 'item renderer code'),
        RSC.TextProperty          (my,'ItemStyling',     DefaultItemStyling, 'item styling'),
      )

      onAttributeChange((Name, newValue) => (
        RSC.handleEventAttribute  (Name,newValue, my,'item-clicked')    ||
        RSC.handleEventAttribute  (Name,newValue, my,'item-selected')   ||
        RSC.handleEventAttribute  (Name,newValue, my,'item-deselected') ||
        RSC.handleEventAttribute  (Name,newValue, my,'item-expanded')   ||
        RSC.handleEventAttribute  (Name,newValue, my,'item-collapsed')  ||
        RSC.handleNumericAttribute(Name,newValue, my,'SelectionLimit')  ||
        RSC.handleNumericAttribute(Name,newValue, my,'Indentation')
      )) // other attributes will be handled automatically

      toRender(() => {
        let {
          Value, Placeholder, selectedPaths,SelectionLimit,SelectionMode,
          expandedPaths,Indentation, ItemLabel,ItemContentList, ItemRenderer,ItemStyling
        } = my.observed

      /**** check if a given item is selected or expanded ****/

        function PathsAreEqual (PathA:number[],PathB:number[]):boolean {
          return (
            (PathA.length === PathB.length) &&
            PathA.every((Item,Index) => Item === PathB[Index])
          )
        }

        function IndexOfPathIn (Path:number[],PathList:number[][]):number {
          for (let i = 0, l = PathList.length; i < l; i++) {
            if (PathsAreEqual(Path,PathList[i])) { return i }
          }
          return -1
        }

        function ItemIsSelected (Path:number[]):boolean { return (IndexOfPathIn(Path,selectedPaths) >= 0) }
        function ItemIsExpanded (Path:number[]):boolean { return (IndexOfPathIn(Path,expandedPaths) >= 0) }

      /**** retrieve item label and content list ****/

        let LabelOfItem = (Item:Indexable) => Item.Label
        if (ItemLabel.trim() !== '') try {
// @ts-ignore 2322 allow function assignment
          LabelOfItem = new Function('Item',ItemLabel)
        } catch (Signal) {
          RSC.throwError('"ItemLabel" compilation error: ' + Signal)
        }

        let ContentListOfItem = (Item:Indexable) => Item.ContentList
        if (ItemContentList.trim() !== '') try {
// @ts-ignore 2322 allow function assignment
          ContentListOfItem = new Function('Item',ItemContentList)
        } catch (Signal) {
          RSC.throwError('"ItemContentList" compilation error: ' + Signal)
        }

      /**** prepare item renderer ****/

// @ts-ignore 7006 allow untyped parameters in this literal
        let RendererOfItem = (my,Item,Path,ItemIsSelected,ItemHasContent,ItemIsExpanded) => {
          if (ItemHasContent) {
            if (ItemIsExpanded) {
              return '<img class="ExpansionMarker" src="/svg/icons/caret-down.svg"/> ' + LabelOfItem(Item)
            } else {
              return '<img class="ExpansionMarker" src="/svg/icons/caret-right.svg"/> ' + LabelOfItem(Item)
            }
          } else {
            return '<img src="/svg/icons/circle.svg"/> ' + LabelOfItem(Item)
          }
        }
        if (ItemRenderer.trim() !== '') try {
// @ts-ignore 2322 allow function assignment
          RendererOfItem = new Function('my,Item,Path,ItemIsSelected,ItemHasContent,ItemIsExpanded',ItemRenderer)
        } catch (Signal) {
          RSC.throwError('"ItemRenderer" compilation error: ' + Signal)
        }

      /**** prepare click handling ****/

        function ItemNotInContainer (ItemPath:number[],ContainerPath:number[]):boolean {
          return (
            (ItemPath.length !== ContainerPath.length+1) ||
            ! PathsAreEqual(ItemPath.slice(0,ContainerPath.length),ContainerPath)
          )
        }

        function onClick (Event:Event):void {
          Event.stopImmediatePropagation()
          Event.preventDefault()

// @ts-ignore 2339 allow "getAttribute" access
          const ItemPath = Event.currentTarget.getAttribute('id').split('-')
            .map((PathItem:string) => parseInt(PathItem,10))

// @ts-ignore 2339 allow "classList" access
          if (Event.target.classList.contains('ExpansionMarker')) {
            onExpansionClick(ItemPath)
          } else {
            onSelectionClick(ItemPath)
          }
        }

        function onSelectionClick (Path:number[]):void {
          let SelectionIndex = IndexOfPathIn(Path,selectedPaths)
          if (SelectionIndex < 0) {
            let deselectedPaths:number[][] = []
            if (SelectionMode === 'same-container') {
              let ContainerPath = Path.slice(0,Path.length-1)
              for (let i = selectedPaths.length-1; i >= 0; i--) {
                if (ItemNotInContainer(selectedPaths[i],ContainerPath)) {
                  deselectedPaths = deselectedPaths.concat(selectedPaths.splice(i,1))
                }
              }
            }
            if (selectedPaths.length >= SelectionLimit) {
              deselectedPaths = deselectedPaths.concat(
                selectedPaths.splice(0,selectedPaths.length-SelectionLimit+1)
              )
            }

            selectedPaths.push(Path)
            my.observed.selectedPaths = selectedPaths

            deselectedPaths.forEach(
              (Path:number[]) => trigger('item-deselected',[Path])
            )
            trigger('item-selected',[Path])
          } else {
            selectedPaths.splice(SelectionIndex,1)
            my.observed.selectedPaths = selectedPaths
            trigger('item-deselected',[Path])
          }
        }

        function onExpansionClick (Path:number[]):void {
          let ExpansionIndex = IndexOfPathIn(Path,expandedPaths)
          if (ExpansionIndex < 0) {
            expandedPaths.push(Path)
            my.observed.expandedPaths = expandedPaths
            trigger('item-expanded',[Path])
          } else {
            expandedPaths.splice(ExpansionIndex,1)
            my.observed.expandedPaths = expandedPaths
            trigger('item-collapsed',[Path])
          }
        }

      /**** render a given (sub)list of items ****/

        function renderListInto (
          ItemList:any[], curIndentation:number, BasePath:number[],
          renderedItems:any[]
        ):void {
          for (let i = 0, l = ItemList.length; i < l; i++) {
            let Item        = ItemList[i]
            let ItemPath    = BasePath.concat(i)
            let ContentList = ContentListOfItem(Item) || []
            let isSelected  = ItemIsSelected(ItemPath)
            let isExpanded  = ItemIsExpanded(ItemPath)

            try {
              let renderedItem = RendererOfItem(
                my,Item,ItemPath,isSelected,(ContentList.length > 0),isExpanded
              )

              if (! JIL.ValueIsText(renderedItem)) JIL.throwError(
                'Item Rendering Failure: rendering of item [' + ItemPath.join(',') + '] did not ' +
                'produce proper HTML code'
              )

              renderedItems.push(html`
                <div id=${ItemPath.join('-')} class=${isSelected ? 'selected' : undefined}
                  style="padding-left:${10+curIndentation}px"
                  dangerouslySetInnerHTML=${{__html:renderedItem}}
                  onClick=${onClick}
                />
              `)

              if (isExpanded) {
                renderListInto(ContentList, curIndentation+Indentation, ItemPath, renderedItems)
              }
            } catch (Signal) {
              RSC.throwError('Rendering of item [' + ItemPath.join(',') + '] failed: ' + Signal)
            }
          }
        }

      /**** now render the whole list ****/

        let renderedItems:any[] = []
        renderListInto(Value, 0, [], renderedItems)

        return html`
          <style>
            :host {
              display:inline-block; position:relative;
              left:0px; top:0px; width:100%; height:100%;
              overflow:auto scroll; overflow-x:auto; overflow-y:scroll;
            }
            :host > div      { display:block; position:relative }
            .ExpansionMarker { display:inline-block; position:relative }

            ${ItemStyling}
          </style>

          ${renderedItems.length === 0
            ? html`<rsc-centered>${Placeholder}</rsc-centered>`
            : renderedItems
          }
        `
      })
    },
    ['Value','Placeholder','selectedPaths','SelectionLimit','SelectionMode','expandedPaths','Indentation','ItemLabel','ItemContentList','ItemRenderer','ItemStyling']
  )

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

/**** ListPropertySatisfying ****/

  export function ListPropertySatisfying (
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
  TextProperty, TextlineProperty, ListProperty, ListPropertySatisfying,
  OneOfProperty, OneOfListProperty,
  URLProperty, URLListProperty,
  handleEventAttribute, handleEventAttributes,
  handleBooleanAttribute, handleBooleanListAttribute,
  handleNumericAttribute, handleNumericListAttribute,
  handleLiteralAttribute, handleLiteralListAttribute, handleLiteralLinesAttribute,
  handleSettingOrKeywordAttribute,
  handleJSONAttribute, handleJSONLinesAttribute,
} = RSC
