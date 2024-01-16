import * as JIL from 'javascript-interface-library';
import { ValidatorForClassifier, acceptNil, rejectNil, throwError, quoted, ValueIsStringMatching, ValueIsObject, ValueIsTextline, ValueIsText, ValueIsBoolean, ValueIsNumber, ValueIsNumberInRange, ValueIsInteger, ValueIsIntegerInRange, ValueIsString, ValueIsURL, expectTextline, expectFunction, ValueIsListSatisfying, allowListSatisfying, ValueIsFunction, expectedTextline, ValueIsArray, ObjectIsEmpty } from 'javascript-interface-library';
import { html, render } from 'htm/preact';
import hyperactiv from 'hyperactiv';

/*******************************************************************************
*                                                                              *
*           Reactive Scriptable Components (RSC, pronounced "resc")            *
*                                                                              *
*******************************************************************************/
const { observe, computed, dispose } = hyperactiv;
/**** hide all undefined custom elements (to avoid initial flashing) ****/
const Stylesheet = document.createElement('style');
Stylesheet.innerHTML = ':not(:defined) { visibility:hidden }';
document.head.appendChild(Stylesheet);
var RSC;
(function (RSC) {
    //------------------------------------------------------------------------------
    //--                             Type Definitions                             --
    //------------------------------------------------------------------------------
    /**** throwReadOnlyError ****/
    function throwReadOnlyError(Name) {
        throwError('ReadOnlyProperty: property ' + quoted(Name) + ' must not be set');
    }
    RSC.throwReadOnlyError = throwReadOnlyError;
    //------------------------------------------------------------------------------
    //--                 Classification and Validation Functions                  --
    //------------------------------------------------------------------------------
    /**** ValueIsDOMElement ****/
    function ValueIsDOMElement(Value) {
        return (Value instanceof Element);
    }
    RSC.ValueIsDOMElement = ValueIsDOMElement;
    /**** allow/expect[ed]DOMElement ****/
    RSC.allowDOMElement = ValidatorForClassifier(ValueIsDOMElement, acceptNil, 'DOM element'), RSC.allowedDOMElement = RSC.allowDOMElement;
    RSC.expectDOMElement = ValidatorForClassifier(ValueIsDOMElement, rejectNil, 'DOM element'), RSC.expectedDOMElement = RSC.expectDOMElement;
    /**** ValueIsVisual ****/
    function ValueIsVisual(Value) {
        return (Value instanceof RSC_Visual);
    }
    RSC.ValueIsVisual = ValueIsVisual;
    /**** allow/expect[ed]Visual ****/
    RSC.allowVisual = ValidatorForClassifier(ValueIsVisual, acceptNil, 'RSC visual'), RSC.allowedVisual = RSC.allowVisual;
    RSC.expectVisual = ValidatorForClassifier(ValueIsVisual, rejectNil, 'RSC visual'), RSC.expectedVisual = RSC.expectVisual;
    /**** ValueIsName ****/
    const RSC_NamePattern = /^[a-z$_][a-z$_0-9]*(-[a-z$_0-9]+)*$/i;
    function ValueIsName(Value) {
        return ValueIsStringMatching(Value, RSC_NamePattern);
    }
    RSC.ValueIsName = ValueIsName;
    /**** allow/expect[ed]Name ****/
    RSC.allowName = ValidatorForClassifier(ValueIsName, acceptNil, 'RSC name'), RSC.allowedName = RSC.allowName;
    RSC.expectName = ValidatorForClassifier(ValueIsName, rejectNil, 'RSC name'), RSC.expectedName = RSC.expectName;
    /**** ValueIsErrorInfo ****/
    function ValueIsErrorInfo(Value) {
        return (ValueIsObject(Value) &&
            ValueIsTextline(Value.Title) &&
            ValueIsText(Value.Message));
    }
    RSC.ValueIsErrorInfo = ValueIsErrorInfo;
    /**** allow/expect[ed]ErrorInfo ****/
    RSC.allowErrorInfo = ValidatorForClassifier(ValueIsErrorInfo, acceptNil, 'RSC error information record'), RSC.allowedErrorInfo = RSC.allowErrorInfo;
    RSC.expectErrorInfo = ValidatorForClassifier(ValueIsErrorInfo, rejectNil, 'RSC error information record'), RSC.expectedErrorInfo = RSC.expectErrorInfo;
    //------------------------------------------------------------------------------
    //--                        Value Acceptance Functions                        --
    //------------------------------------------------------------------------------
    /**** acceptableBoolean ****/
    function acceptableBoolean(Value, Default) {
        return (ValueIsBoolean(Value) ? Value : Default);
    }
    RSC.acceptableBoolean = acceptableBoolean;
    /**** acceptableNumber ****/
    function acceptableNumber(Value, Default) {
        return (ValueIsNumber(Value) ? Value : Default);
    }
    RSC.acceptableNumber = acceptableNumber;
    /**** acceptableNumberInRange ****/
    function acceptableNumberInRange(Value, Default, minValue = -Infinity, maxValue = Infinity, withMin = false, withMax = false) {
        return (ValueIsNumberInRange(Value, minValue, maxValue, withMin, withMax) ? Value : Default);
    }
    RSC.acceptableNumberInRange = acceptableNumberInRange;
    /**** acceptableInteger ****/
    function acceptableInteger(Value, Default) {
        return (ValueIsInteger(Value) ? Value : Default);
    }
    RSC.acceptableInteger = acceptableInteger;
    /**** acceptableIntegerInRange ****/
    function acceptableIntegerInRange(Value, Default, minValue = -Infinity, maxValue = Infinity) {
        return (ValueIsIntegerInRange(Value, minValue, maxValue) ? Value : Default);
    }
    RSC.acceptableIntegerInRange = acceptableIntegerInRange;
    /**** acceptableString ****/
    function acceptableString(Value, Default) {
        return (ValueIsString(Value) ? Value : Default);
    }
    RSC.acceptableString = acceptableString;
    /**** acceptableNonEmptyString ****/
    function acceptableNonEmptyString(Value, Default) {
        return (ValueIsString(Value) && (Value.trim() !== '') ? Value : Default);
    }
    RSC.acceptableNonEmptyString = acceptableNonEmptyString;
    /**** acceptableStringMatching ****/
    function acceptableStringMatching(Value, Default, Pattern) {
        return (ValueIsStringMatching(Value, Pattern) ? Value : Default);
    }
    RSC.acceptableStringMatching = acceptableStringMatching;
    /**** acceptableURL ****/
    function acceptableURL(Value, Default) {
        return (ValueIsURL(Value) ? Value : Default);
    }
    RSC.acceptableURL = acceptableURL;
    //------------------------------------------------------------------------------
    //--                      Initialization Marker Handling                      --
    //------------------------------------------------------------------------------
    const InitializationMarkerForVisual = new WeakMap();
    /**** VisualWasInitialized ****/
    function VisualWasInitialized(Visual) {
        return (InitializationMarkerForVisual.get(Visual) === true);
    }
    /**** markVisualAsInitialized ****/
    function markVisualAsInitialized(Visual) {
        InitializationMarkerForVisual.set(Visual, true);
    }
    //------------------------------------------------------------------------------
    //--                           Containment Handling                           --
    //------------------------------------------------------------------------------
    /**** outerVisualOf ****/
    function outerVisualOf(DOMElement) {
        RSC.expectDOMElement('element', DOMElement);
        DOMElement = DOMElement.parentElement;
        while (DOMElement != null) {
            if (ValueIsVisual(DOMElement)) {
                return DOMElement;
            }
            DOMElement = DOMElement.parentElement;
        }
        return undefined;
    }
    RSC.outerVisualOf = outerVisualOf;
    RSC.VisualContaining = outerVisualOf;
    /**** outermostVisualOf ****/
    function outermostVisualOf(DOMElement) {
        RSC.expectDOMElement('element', DOMElement);
        let outermostVisual = undefined;
        DOMElement = DOMElement.parentElement;
        while (DOMElement != null) {
            if (ValueIsVisual(DOMElement)) {
                outermostVisual = DOMElement;
            }
            DOMElement = DOMElement.parentElement;
        }
        return outermostVisual;
    }
    RSC.outermostVisualOf = outermostVisualOf;
    /**** closestVisualWithBehaviour ****/
    function closestVisualWithBehaviour(DOMElement, BehaviourName) {
        RSC.expectDOMElement('element', DOMElement);
        RSC.expectName('behaviour name', BehaviourName);
        const normalizedName = BehaviourName.toLowerCase();
        while (DOMElement != null) {
            if (ValueIsVisual(DOMElement) &&
                ((BehaviourNameOfVisual(DOMElement) || '').toLowerCase() === normalizedName)) {
                return DOMElement;
            }
            DOMElement = outerVisualOf(DOMElement);
        }
        return undefined;
    }
    RSC.closestVisualWithBehaviour = closestVisualWithBehaviour;
    /**** closestVisualMatching ****/
    function closestVisualMatching(DOMElement, Selector) {
        RSC.expectDOMElement('element', DOMElement);
        expectTextline('CSS selector', Selector);
        while (DOMElement != null) {
            if (ValueIsVisual(DOMElement) && DOMElement.matches(Selector)) {
                return DOMElement;
            }
            DOMElement = outerVisualOf(DOMElement);
        }
        return undefined;
    }
    RSC.closestVisualMatching = closestVisualMatching;
    /**** innerElementsOf ****/
    function innerElementsOf(DOMElement) {
        return Array.from(DOMElement.children);
    }
    /**** innerVisualsOf ****/
    function innerVisualsOf(DOMElement) {
        RSC.expectDOMElement('element', DOMElement);
        const innerVisuals = Array.from(DOMElement.children)
            .filter((innerElement) => ValueIsVisual(innerElement));
        return innerVisuals;
    }
    RSC.innerVisualsOf = innerVisualsOf;
    /**** Behaviours are global ****/
    const BehaviourRegistry = Object.create(null);
    /**** InfoForBehaviour ****/
    function InfoForBehaviour(Name) {
        return BehaviourRegistry[Name.toLowerCase()];
    }
    /**** registerBehaviour ****/
    function registerBehaviour(Name, SourceOrExecutable, observedAttributes = []) {
        var _a;
        let normalizedName = Name.toLowerCase();
        allowListSatisfying('list of observed element attributes', observedAttributes, ValueIsName);
        const AttributeSet = Object.create(null);
        if (observedAttributes != null) {
            observedAttributes.forEach((Name) => AttributeSet[Name.toLowerCase()] = Name);
            observedAttributes = observedAttributes.map((Name) => Name.toLowerCase());
        }
        if (ValueIsFunction(SourceOrExecutable)) {
            BehaviourRegistry[normalizedName] = {
                Name, AttributeSet, Executable: SourceOrExecutable
            };
        }
        else {
            if (normalizedName in BehaviourRegistry) {
                const BehaviourInfo = BehaviourRegistry[normalizedName];
                if (BehaviourInfo.Source == null)
                    throwError('ForbiddenOperation: cannot overwrite intrinsic behaviour ' + quoted(Name));
                if (BehaviourInfo.Source.trim() !== SourceOrExecutable.trim())
                    throwError('ForbiddenOperation: cannot overwrite existing behaviour ' + quoted(Name));
            }
            else {
                let Source = SourceOrExecutable;
                let Executable;
                try {
                    Executable = compiledScript(Source);
                }
                catch (Signal) {
                    console.error(`CompilationError: compilation of behaviour ${quoted(Name)} failed. ` +
                        'Reason: ' + Signal);
                    BehaviourRegistry[normalizedName] = {
                        Name, AttributeSet, Source, Error: {
                            Title: 'Compilation Failure',
                            Message: `Compilation of behaviour ${quoted(Name)} failed.\n\n` +
                                'Reason:' + Signal
                        }
                    };
                    return;
                }
                BehaviourRegistry[normalizedName] = {
                    Name, AttributeSet, Source, Executable
                };
            }
        }
        /**** install a custom element for the given behaviour ****/
        const customizedVisual = (_a = class extends RSC_Visual {
            },
            _a.observedAttributes = observedAttributes,
            _a);
        customElements.define('rsc-' + normalizedName, customizedVisual);
    }
    BehaviourRegistry['visual'] = {
        Name: 'Visual', AttributeSet: { value: 'Value' }
    };
    /**** registerBehaviourFromElement ****/
    function registerBehaviourFromElement(ScriptElement) {
        let Name = RSC.expectedName('behaviour name', ScriptElement.getAttribute('for-behaviour'));
        if (Name.toLowerCase() === 'visual')
            throwError('ReservedName: behaviour name "visual" is reserved for internal use');
        let Source = ScriptElement.innerHTML;
        let observedAttributes = ((ScriptElement.getAttribute('observed-attributes') || '')
            .split(/\s*(?:,|$)\s*/).filter((Name) => (Name || '').trim() !== ''));
        if (!ValueIsListSatisfying(observedAttributes, ValueIsName))
            throwError('Invalidargument: attribute "observed-attributes" does not contain a ' +
                'list of valid RSC attribute names');
        registerBehaviour(Name, Source, observedAttributes);
        permitVisualsWithinBehaviour(Name, ScriptElement.getAttribute('permitted-contents') || '');
        forbidVisualsWithinBehaviour(Name, ScriptElement.getAttribute('fobidden-contents') || '');
    }
    /**** registerAllBehavioursFoundInHead ****/
    function registerAllBehavioursFoundInHead() {
        innerElementsOf(document.head).forEach((Element) => {
            if (Element.matches('script[type="rsc-script"][for-behaviour]')) {
                registerBehaviourFromElement(Element);
            }
        });
    }
    /**** registerAllBehavioursFoundInVisual ****/
    function registerAllBehavioursFoundInVisual(Visual) {
        innerElementsOf(Visual).forEach((Element) => {
            if (Element.matches('script[type="rsc-script"][for-behaviour]')) {
                registerBehaviourFromElement(Element);
            }
        });
    }
    //registerAllBehavioursFoundInHead()           // not yet, only after RSC_Visual
    /**** BehaviourNameOfVisual ****/
    function BehaviourNameOfVisual(Visual) {
        var _a;
        let BehaviourName = Visual.tagName.slice(4).toLowerCase();
        if (BehaviourName === 'visual') {
            BehaviourName = Visual.getAttribute('behaviour');
            return (ValueIsName(BehaviourName) ? BehaviourName : 'visual');
        }
        else {
            return ((_a = InfoForBehaviour(BehaviourName)) === null || _a === void 0 ? void 0 : _a.Name) || BehaviourName;
        }
    }
    const permittedVisualsSelectorWithinBehaviour = Object.create(null);
    const forbiddenVisualsSelectorWithinBehaviour = Object.create(null);
    /**** permitVisualsWithinBehaviour ****/
    function permitVisualsWithinBehaviour(BehaviourName, Selector) {
        Selector = Selector.trim();
        if (Selector !== '') {
            const normalizedBehaviourName = BehaviourName.toLowerCase();
            permittedVisualsSelectorWithinBehaviour[normalizedBehaviourName] = Selector;
        }
    }
    /**** forbidVisualsWithinBehaviour ****/
    function forbidVisualsWithinBehaviour(BehaviourName, Selector) {
        Selector = Selector.trim();
        if (Selector !== '') {
            const normalizedBehaviourName = BehaviourName.toLowerCase();
            forbiddenVisualsSelectorWithinBehaviour[normalizedBehaviourName] = Selector;
        }
    }
    /**** validateContentsOfVisual ****/
    function validateContentsOfVisual(Visual) {
        const BehaviourName = BehaviourNameOfVisual(Visual);
        if (BehaviourName == null) {
            return;
        }
        const normalizedBehaviourName = BehaviourName.toLowerCase();
        let permittedVisualsSelector = permittedVisualsSelectorWithinBehaviour[normalizedBehaviourName];
        let forbiddenVisualsSelector = forbiddenVisualsSelectorWithinBehaviour[normalizedBehaviourName];
        if ((permittedVisualsSelector != null) || (forbiddenVisualsSelector != null)) {
            innerVisualsOf(Visual).forEach((innerVisual) => {
                if (((permittedVisualsSelector != null) &&
                    !innerVisual.matches(permittedVisualsSelector)) || ((forbiddenVisualsSelector != null) &&
                    innerVisual.matches(forbiddenVisualsSelector))) {
                    innerVisual.remove();
                }
            });
        }
    }
    /**** validateContainerOfVisual ****/
    function validateContainerOfVisual(Visual) {
        const Container = outerVisualOf(Visual);
        if (Container == null) {
            return;
        }
        const BehaviourName = BehaviourNameOfVisual(Container);
        if (BehaviourName == null) {
            return;
        }
        const normalizedBehaviourName = BehaviourName.toLowerCase();
        let permittedVisualsSelector = permittedVisualsSelectorWithinBehaviour[normalizedBehaviourName];
        if (permittedVisualsSelector != null) {
            if (!Visual.matches(permittedVisualsSelector))
                throwError('InacceptableInnerVisual: the given visual is not allowed to become a ' +
                    'part of its container');
        }
        let forbiddenVisualsSelector = forbiddenVisualsSelectorWithinBehaviour[normalizedBehaviourName];
        if (forbiddenVisualsSelector != null) {
            if (Visual.matches(forbiddenVisualsSelector))
                throwError('InacceptableInnerVisual: the given visual is not allowed to become a ' +
                    'part of its container');
        }
    }
    const ScriptDelegationSetForVisual = new WeakMap();
    /**** registerDelegatedScriptInVisual ****/
    function registerDelegatedScriptInVisual(Visual, Selector, Source) {
        let ScriptDelegationSet = ScriptDelegationSetForVisual.get(Visual);
        if (ScriptDelegationSet == null) {
            ScriptDelegationSetForVisual.set(Visual, ScriptDelegationSet = Object.create(null));
        }
        if (Selector in ScriptDelegationSet)
            throwError('ForbiddenOperation: a script for elements matching selector ' +
                quoted(Selector) + ' exists already');
        let Executable;
        try {
            Executable = compiledScript(Source);
        }
        catch (Signal) {
            throwError('CompilationError: compilation of delegated script for elements ' +
                'matching selector ' + quoted(Selector) + ' failed. ' +
                'Reason: ' + Signal);
        }
        ScriptDelegationSet[Selector] = { Selector, Source, Executable };
    }
    /**** registerDelegatedScriptFromElement ****/
    function registerDelegatedScriptFromElement(Visual, ScriptElement) {
        let Selector = expectedTextline('element selector', ScriptElement.getAttribute('for'));
        let Script = ScriptElement.innerHTML;
        registerDelegatedScriptInVisual(Visual, Selector, Script);
    }
    /**** registerAllDelegatedScriptsFoundInVisual ****/
    function registerAllDelegatedScriptsFoundInVisual(Visual) {
        innerElementsOf(Visual).forEach((Element) => {
            if (Element.matches('script[type="rsc-script"][for]')) {
                registerDelegatedScriptFromElement(Visual, Element);
            }
        });
    }
    /**** delegatedScriptInfoForVisual ****/
    function delegatedScriptInfoForVisual(Visual) {
        let ScriptContainer = Visual;
        while (ScriptContainer != null) {
            let ScriptDelegationSet = ScriptDelegationSetForVisual.get(ScriptContainer);
            if (ScriptDelegationSet != null) {
                for (const Selector in ScriptDelegationSet) {
                    if (Visual.matches(Selector)) {
                        return ScriptDelegationSet[Selector];
                    }
                }
            }
            ScriptContainer = outerVisualOf(ScriptContainer);
        }
    }
    //------------------------------------------------------------------------------
    //--                             Script Handling                              --
    //------------------------------------------------------------------------------
    /**** ScriptOfVisual ****/
    function ScriptOfVisual(Visual) {
        let Script = Visual.getAttribute('script') || '';
        return (Script.trim() === '' ? undefined : Script);
    }
    /**** ScriptInVisual ****/
    function ScriptInVisual(Visual) {
        const ScriptList = innerElementsOf(Visual);
        for (let i = 0, l = ScriptList.length; i < l; i++) {
            let Candidate = ScriptList[i];
            if ((Candidate.tagName === 'SCRIPT') &&
                ((Candidate.getAttribute('type') || '') === 'rsc-script') &&
                !Candidate.hasAttribute('for') && !Candidate.hasAttribute('for-behaviour')) {
                return Candidate.innerHTML;
            }
        }
    }
    /**** compiledScript - throws on failure ****/
    function compiledScript(Script) {
        return new Function('RSC,JIL, onAttributeChange, onAttachment,onDetachment, toRender,' +
            'html, on,once,off,trigger, reactively', Script || ''); // may fail!
    }
    /**** applyExecutable - throws on failure ****/
    function applyExecutable(Visual, Executable) {
        const onAttributeChange = Visual.onAttributeChange.bind(Visual);
        const onAttachment = Visual.onAttachment.bind(Visual);
        const onDetachment = Visual.onDetachment.bind(Visual);
        const toRender = Visual.toRender.bind(Visual);
        /**** on ****/
        function on(Events, SelectorOrHandler, DataOrHandler, Handler) {
            registerEventHandlerForVisual(Visual, Events, SelectorOrHandler, DataOrHandler, Handler);
        }
        /**** once ****/
        function once(Events, SelectorOrHandler, DataOrHandler, Handler) {
            registerEventHandlerForVisual(Visual, Events, SelectorOrHandler, DataOrHandler, Handler, 'once');
        }
        /**** off ****/
        function off(Events, SelectorOrHandler, Handler) {
            let ArgList = Array.prototype.slice.call(arguments, 1);
            Events = (Events || '').trim().replace(/\s+/g, ' ');
            if (Events === '') {
                unregisterAllMatchingEventHandlersFromVisual(Visual);
                return;
            }
            let Selector = (ValueIsString(ArgList[0])
                ? ArgList.shift().trim()
                : (ArgList[0] === null ? ArgList.shift() || '' : undefined)); // "null" means: no selector, "undefined" means: any selector
            Handler = ArgList.shift();
            if (Handler == null) {
                unregisterAllMatchingEventHandlersFromVisual(Visual, Events, Selector);
            }
            else {
                unregisterAllMatchingEventHandlersFromVisual(Visual, Events, Selector, Handler);
            }
        }
        /**** trigger ****/
        function trigger(EventToTrigger, Arguments, bubbles = true) {
            Arguments = (ValueIsArray(Arguments) ? Arguments.slice() : []);
            switch (true) {
                case ValueIsString(EventToTrigger):
                    EventToTrigger = new CustomEvent(EventToTrigger, {
                        bubbles, cancelable: true, detail: { Arguments }
                    });
                    break;
                case (EventToTrigger instanceof Event):
                    EventToTrigger = new CustomEvent(EventToTrigger.type, Object.assign({}, EventToTrigger, {
                        bubbles, cancelable: true, detail: { Arguments }
                    }));
                    break;
                default:
                    debugger;
                    throwError('InvalidArgument: Event instance or literal event type expected');
            }
            Visual.dispatchEvent(EventToTrigger);
            const EventDetails = EventToTrigger.detail;
            if ((EventDetails === null || EventDetails === void 0 ? void 0 : EventDetails.Error) == null) {
                return EventDetails === null || EventDetails === void 0 ? void 0 : EventDetails.Result;
            }
            else {
                throw EventDetails === null || EventDetails === void 0 ? void 0 : EventDetails.Error;
            }
        }
        /**** reactively ****/
        function reactively(reactiveFunction) {
            expectFunction('reactive function', reactiveFunction);
            // @ts-ignore we definitely want the function argument to be accepted
            registerReactiveFunctionIn(Visual, computed(reactiveFunction));
        }
        /**** run "Executable" in the context of "Visual" ****/
        Executable.apply(Visual, [
            RSC, JIL, onAttributeChange, onAttachment, onDetachment, toRender,
            html, on, once, off, trigger, reactively
        ]);
    }
    /**** applyBehaviourScriptOfVisual ****/
    function applyBehaviourScriptOfVisual(Visual) {
        const BehaviourName = BehaviourNameOfVisual(Visual);
        if (BehaviourName == null) {
            return;
        }
        const BehaviourInfo = InfoForBehaviour(BehaviourName);
        if (BehaviourInfo == null) {
            setErrorOfVisual(Visual, {
                Title: 'Missing Behaviour',
                Message: 'Behaviour ' + quoted(BehaviourName) + ' could not be found'
            });
            return;
        }
        if (BehaviourInfo.Error != null) {
            setErrorOfVisual(Visual, BehaviourInfo.Error);
            return;
        }
        const Executable = BehaviourInfo.Executable;
        if (Executable == null) {
            return;
        }
        try {
            applyExecutable(Visual, Executable);
        }
        catch (Signal) {
            console.error(Signal);
            setErrorOfVisual(Visual, {
                Title: 'Execution Failure',
                Message: 'Script of behaviour ' + quoted(BehaviourName) + ' could not ' +
                    'be executed.\n\nReason:\n' + Signal
            });
            return;
        }
    }
    /**** applyElementScriptOfVisual ****/
    function applyElementScriptOfVisual(Visual) {
        const Script = ScriptOfVisual(Visual) || ScriptInVisual(Visual);
        if (Script != null) {
            let Executable;
            try {
                Executable = compiledScript(Script);
            }
            catch (Signal) {
                console.error(Signal);
                setErrorOfVisual(Visual, {
                    Title: 'Compilation Failure',
                    Message: 'Visual script could not be compiled.\n\nReason:\n' + Signal
                });
            }
            try {
                applyExecutable(Visual, Executable);
            }
            catch (Signal) {
                console.error(Signal);
                setErrorOfVisual(Visual, {
                    Title: 'Execution Failure',
                    Message: 'Visual script could not be executed.\n\nReason:\n' + Signal
                });
            }
            return;
        }
        const ScriptDelegationInfo = delegatedScriptInfoForVisual(Visual);
        if (ScriptDelegationInfo != null) {
            if (ScriptDelegationInfo.Error != null) {
                setErrorOfVisual(Visual, ScriptDelegationInfo.Error);
                return;
            }
            try {
                applyExecutable(Visual, ScriptDelegationInfo.Executable);
            }
            catch (Signal) {
                console.error(Signal);
                setErrorOfVisual(Visual, {
                    Title: 'Execution Failure',
                    Message: 'delegated visual script with selector ' +
                        quoted(ScriptDelegationInfo.Selector) + ' could not be ' +
                        'executed.\n\nReason:\n' + Signal
                });
                return;
            }
        }
    }
    //------------------------------------------------------------------------------
    //--                              Event Handling                              --
    //------------------------------------------------------------------------------
    /**** ValueIsEventNameWithSelector ****/
    const RSC_NameWithSelectorPattern = /^[a-z$_][a-z$_0-9]*([-.:][a-z$_0-9]+)*@.*$/i;
    function ValueIsEventNameWithSelector(Value) {
        return ValueIsStringMatching(Value, RSC_NameWithSelectorPattern);
    }
    /**** registerEventHandlerForVisual ****/
    function registerEventHandlerForVisual(Visual, Events, SelectorOrHandler, DataOrHandler, Handler, once) {
        let ArgList = Array.prototype.slice.call(arguments, 1);
        Events = ArgList.shift().trim().replace(/\s+/g, ' ');
        if (Events === '') {
            return;
        }
        let Selector = (ValueIsString(ArgList[0])
            ? ArgList.shift().trim()
            : (ArgList[0] == null ? ArgList.shift() || '' : '')); // '' means: no selector
        let Data = (typeof ArgList[1] === 'function'
            ? ArgList.shift()
            : undefined);
        Handler = ArgList.shift();
        _registerEventHandlerForVisual(Visual, Events, Selector, Data, Handler, once);
    }
    /**** _registerEventHandlerForVisual ****/
    const EventRegistryForVisual = new WeakMap();
    function _registerEventHandlerForVisual(Visual, Events, Selector, Data, Handler, once) {
        /**** actualHandler ****/
        function actualHandler(Event) {
            var _a;
            switch (Selector) {
                case '':
                    break;
                case '@this':
                    if (Event.target !== Event.currentTarget) {
                        return;
                    }
                    break;
                default:
                    if (!Event.target.matches(Selector)) {
                        return;
                    }
            }
            if (Data != null) {
                Event.data = Data;
            }
            if (once) {
                unregisterAllMatchingEventHandlersFromVisual(Visual, Event.type, Selector, Handler);
            }
            let ArgList = [Event].concat(((_a = Event.detail) === null || _a === void 0 ? void 0 : _a.Arguments) || []);
            try {
                const Result = Handler.apply(Visual, ArgList);
                if (Result !== undefined) {
                    ;
                    (Event.detail || {}).Result = Result;
                    Event.stopImmediatePropagation();
                    Event.preventDefault();
                }
            }
            catch (Signal) {
                (Event.detail || {}).Error = Signal;
                Event.stopImmediatePropagation();
                Event.preventDefault();
            }
        }
        actualHandler['isFor'] = Handler;
        let EventList;
        if (ValueIsEventNameWithSelector(Events)) {
            let AtIndex = Events.indexOf('@');
            EventList = [Events.slice(0, AtIndex)];
            Selector = Events.slice(AtIndex + 1);
            if (Selector === 'this') {
                Selector = '@this';
            } // special case
        }
        else {
            EventList = Events.split(' ');
        }
        let EventRegistry = EventRegistryForVisual.get(Visual);
        if (EventRegistry == null) {
            EventRegistryForVisual.set(Visual, EventRegistry = Object.create(null));
        }
        EventList.forEach((Event) => {
            let EntriesForEvent = EventRegistry[Event];
            if (EntriesForEvent == null) {
                EntriesForEvent = EventRegistry[Event] = Object.create(null);
            }
            let EntriesForSelector = EntriesForEvent[Selector];
            if (EntriesForSelector == null) {
                EntriesForSelector = EntriesForEvent[Selector] = [];
            }
            EntriesForSelector.push(actualHandler);
            Visual.addEventListener(Event, actualHandler);
        });
    }
    /**** unregisterAllMatchingEventHandlersFromVisual ****/
    function unregisterAllMatchingEventHandlersFromVisual(Visual, Events, Selector, Handler) {
        let EventList;
        if (ValueIsEventNameWithSelector(Events)) {
            let AtIndex = Events.indexOf('@');
            EventList = [Events.slice(0, AtIndex)];
            Selector = Events.slice(AtIndex + 1);
        }
        else {
            EventList = (Events == null ? [] : Events.split(' '));
        }
        const EventRegistry = EventRegistryForVisual.get(Visual);
        if (EventRegistry == null) {
            return;
        }
        if (EventList.length === 0) { // unregister any event handlers
            for (let Event in EventRegistry) {
                unregisterMatchingEventHandlersFromVisual(Visual, Event, Selector, Handler);
            }
        }
        else { // unregister handlers for the given events only
            EventList.forEach((Event) => {
                unregisterMatchingEventHandlersFromVisual(Visual, Event, Selector, Handler);
            });
        }
    }
    /**** unregisterMatchingEventHandlersFromVisual ****/
    function unregisterMatchingEventHandlersFromVisual(Visual, Event, Selector, Handler) {
        const EventRegistry = EventRegistryForVisual.get(Visual);
        if (EventRegistry == null) {
            return;
        }
        let EntriesForEvent = EventRegistry[Event];
        if (EntriesForEvent != null) {
            if (Selector == null) {
                for (let Selector in EntriesForEvent) {
                    unregisterMatchingEventSelectorHandlersFromVisual(Visual, EntriesForEvent, Event, Selector, Handler);
                }
            }
            else {
                unregisterMatchingEventSelectorHandlersFromVisual(Visual, EntriesForEvent, Event, Selector, Handler);
            }
            if (ObjectIsEmpty(EntriesForEvent)) {
                delete EventRegistry[Event];
            }
        }
    }
    /**** unregisterMatchingEventSelectorHandlersFromVisual ****/
    function unregisterMatchingEventSelectorHandlersFromVisual(Visual, EntriesForEvent, Event, Selector, Handler) {
        let EntriesForSelector = EntriesForEvent[Selector];
        if (EntriesForSelector != null) {
            if (Handler == null) {
                EntriesForSelector.forEach((actualHandler) => {
                    // @ts-ignore TypeScript does not allow JS functions here, but that's wrong
                    Visual.removeEventListener(Event, actualHandler);
                });
                EntriesForSelector.length = 0;
            }
            else {
                EntriesForSelector.every((actualHandler, Index) => {
                    if (actualHandler['isFor'] === Handler) {
                        // @ts-ignore TypeScript does not allow JS functions here, but that's wrong
                        Visual.removeEventListener(Event, actualHandler);
                        EntriesForSelector.splice(Index, 1);
                        return false;
                    }
                    return true;
                });
            }
            if (EntriesForSelector.length === 0) {
                delete EntriesForEvent[Selector];
            }
        }
    }
    //------------------------------------------------------------------------------
    //--                           Reactivity Handling                            --
    //------------------------------------------------------------------------------
    const reactiveFunctionsForVisual = new WeakMap();
    const reactiveAttributesForVisual = new WeakMap();
    /**** ObservableOfVisual ****/
    const ObservableForVisual = new WeakMap();
    function ObservableOfVisual(Visual) {
        let Observable = ObservableForVisual.get(Visual);
        if (Observable == null) {
            ObservableForVisual.set(Visual, Observable = observe({}, { deep: false }));
        }
        return Observable;
    }
    /**** UnobservedOfVisual ****/
    const UnobservedForVisual = new WeakMap();
    function UnobservedOfVisual(Visual) {
        let Unobserved = UnobservedForVisual.get(Visual);
        if (Unobserved == null) {
            UnobservedForVisual.set(Visual, Unobserved = {});
        }
        return Unobserved;
    }
    /**** startReactiveRenderingOfVisual ****/
    const reactiveRendererForVisual = new WeakMap();
    function startReactiveRenderingOfVisual(Visual) {
        reactiveRendererForVisual.set(Visual, computed(Visual.render.bind(Visual)));
    }
    /**** ValueIsReactiveAttributeName ****/
    function ValueIsReactiveAttributeName(Value) {
        return (ValueIsString(Value) && (Value.startsWith('$') && ValueIsName(Value.slice(1)) ||
            Value.startsWith('$$') && ValueIsName(Value.slice(2))));
    }
    /**** updateAttributeOfVisual (non-reactive attributes only) ****/
    function updateAttributeOfVisual(Visual, normalizedName, newValue) {
        let AttributeChangeHandler = AttributeChangeHandlerForVisual.get(Visual);
        if (AttributeChangeHandler == null) {
            const BehaviourName = BehaviourNameOfVisual(Visual);
            if (BehaviourName == null) {
                return;
            }
            const Behaviour = InfoForBehaviour(BehaviourName);
            if (Behaviour == null) {
                return;
            }
            const AttributeSet = Behaviour.AttributeSet;
            if (normalizedName in AttributeSet) {
                const originalName = AttributeSet[normalizedName];
                try {
                    Visual.observed[originalName] = newValue;
                }
                catch (Signal) {
                    setErrorOfVisual(Visual, {
                        Title: 'Attribute Change Failure',
                        Message: ('could not update observed property "' +
                            quoted(originalName) + '" upon a change of attribute "' +
                            quoted(normalizedName) + '"')
                    });
                }
            }
        }
        else {
            try {
                AttributeChangeHandler.call(Visual, normalizedName, newValue);
            }
            catch (Signal) {
                setErrorOfVisual(Visual, {
                    Title: 'Attribute Change Handler Failure',
                    Message: 'Running the configured attribute change handler failed\n\n' +
                        'Reason: ' + Signal
                });
            }
        }
    }
    /**** updateAllAttributesOfVisual (non-reactive attributes only) ****/
    function updateAllAttributesOfVisual(Visual) {
        Array.from(Visual.attributes).forEach((Attribute) => {
            const normalizedName = Attribute.name;
            if (ValueIsName(normalizedName)) { // ignores all reactive attributes
                updateAttributeOfVisual(Visual, normalizedName, Attribute.value);
            }
        });
    }
    /**** registerAllReactiveAttributesOfVisual ****/
    function registerAllReactiveAttributesOfVisual(Visual) {
        Array.from(Visual.attributes).forEach((Attribute) => {
            const reactiveName = Attribute.name;
            if (ValueIsReactiveAttributeName(reactiveName)) {
                const BehaviourName = BehaviourNameOfVisual(Visual);
                if (BehaviourName == null) {
                    return;
                }
                const Behaviour = InfoForBehaviour(BehaviourName);
                if (Behaviour == null) {
                    return;
                }
                const normalizedName = reactiveName.replace(/^[$]{1,2}/, '');
                const AttributeSet = Behaviour.AttributeSet;
                if (normalizedName in AttributeSet) {
                    const originalName = AttributeSet[normalizedName];
                    const { Base, PathList } = parsedAccessPathFromVisual(Visual, Attribute.value);
                    let HandlerList = reactiveAttributesForVisual.get(Visual);
                    if (HandlerList == null) {
                        reactiveAttributesForVisual.set(Visual, HandlerList = []);
                    }
                    if (reactiveName.startsWith('$$')) {
                        const Handler = computed(() => {
                            setValueOfReactiveVariable(Base, PathList, Visual.observed[originalName]);
                        });
                        HandlerList.push(Handler);
                    }
                    const Handler = computed(() => {
                        Visual.observed[originalName] = ValueOfReactiveVariable(Base, PathList);
                    });
                    HandlerList.push(Handler);
                }
            }
        });
    }
    const dottedIndexPattern = /^\s*[.]([^.\[]+)/;
    const unquotedIndexPattern = /^\s*\[([^'"\]]+)\]/;
    const sglquotedIndexPattern = /^\s*\[\s*'(([^'\\]|\\(["'\\\/bfnrt]|x[0-9a-f]{2}|u[0-9a-f]{4}))*)'\s*\]/i;
    const dblquotedIndexPattern = /^\s*\[\s*"(([^"\\]|\\(["'\\\/bfnrt]|x[0-9a-f]{2}|u[0-9a-f]{4}))*)"\s*\]/i;
    function parsedAccessPathFromVisual(Visual, literalPath) {
        const SplitIndex = literalPath.indexOf(':observed');
        if (SplitIndex < 0)
            throwError('InvalidAccessPath:invalid access path ' + quoted(literalPath));
        let Selector = literalPath.slice(0, SplitIndex);
        if (ValueIsName(Selector)) {
            const normalizedName = Selector.toLowerCase();
            Selector = `rsc-${normalizedName},[behaviour="${normalizedName}"]`;
        }
        let Base = closestVisualMatching(Visual, Selector);
        if (Base == null)
            throwError('NoSuchVisual:could not find a close visual matching CSS selector' +
                quoted(Selector));
        let AccessPath = literalPath.slice(SplitIndex + 9).trim();
        const PathList = [];
        let Match;
        while (AccessPath !== '') {
            switch (true) {
                case (Match = dottedIndexPattern.exec(AccessPath)) != null:
                case (Match = unquotedIndexPattern.exec(AccessPath)) != null:
                    // @ts-ignore 18048: we know that Match is not null
                    PathList.push(Match[1].trim());
                    // @ts-ignore 18048: we know that Match is not null
                    AccessPath = AccessPath.slice(Match[0].length).trim();
                    break;
                case (Match = sglquotedIndexPattern.exec(AccessPath)) != null:
                case (Match = dblquotedIndexPattern.exec(AccessPath)) != null:
                    // @ts-ignore 18048: we know that Match is not null
                    PathList.push(Match[1]);
                    // @ts-ignore 18048: we know that Match is not null
                    AccessPath = AccessPath.slice(Match[0].length).trim();
                    break;
                default:
                    throwError('InvalidAccessPath:invalid access path ' + quoted(literalPath));
            }
        }
        return { Base, PathList };
    }
    /**** ValueOfReactiveVariable ****/
    function ValueOfReactiveVariable(Base, PathList) {
        let Value = Base.observed[PathList[0]];
        for (let i = 1, l = PathList.length; i < l; i++) {
            if (Value == null)
                throwError('InvalidAccess:cannot access variable bound to reactive attribute');
            Value = Value[PathList[i]];
        }
        return Value;
    }
    /**** setValueOfReactiveVariable ****/
    function setValueOfReactiveVariable(Base, PathList, Value) {
        let Variable = Base;
        for (let i = 0, l = PathList.length - 1; i < l; i++) {
            if (Variable == null)
                throwError('InvalidAccess:cannot access variable bound to reactive attribute');
            Variable = Variable[PathList[i]];
        }
        Variable[PathList[-1]] = Value;
    }
    /**** unregisterAllReactiveAttributesOfVisual ****/
    function unregisterAllReactiveAttributesOfVisual(Visual) {
        let HandlerList = reactiveAttributesForVisual.get(Visual);
        if (HandlerList == null) {
            return;
        }
        HandlerList.forEach((Handler) => {
            dispose(Handler);
        });
    }
    /**** registerReactiveFunctionIn ****/
    function registerReactiveFunctionIn(Visual, reactiveFunction) {
        let reactiveFunctions = reactiveFunctionsForVisual.get(Visual);
        if (reactiveFunctions == null) {
            reactiveFunctionsForVisual.set(Visual, reactiveFunctions = []);
        }
        reactiveFunctions.push(reactiveFunction);
    }
    const ErrorInfoForVisual = new WeakMap();
    /**** setErrorOfVisual ****/
    function setErrorOfVisual(Visual, ErrorInfo) {
        RSC.expectErrorInfo('RSC error info record', ErrorInfo);
        if (ErrorInfoForVisual.get(Visual) == null) {
            ErrorInfoForVisual.set(Visual, ErrorInfo);
            Visual.render();
        }
    }
    /**** ErrorOfVisual ****/
    function ErrorOfVisual(Visual) {
        return ErrorInfoForVisual.get(Visual);
    }
    /**** RSC_ErrorIndicator ****/
    function RSC_ErrorIndicator(PropSet) {
        const Visual = PropSet.visual;
        function onClick(Event) {
            showErrorInfoForVisual(Visual);
        }
        return html `
      <style>
        .RSC-ErrorIndicator {
          display:block; position:absolute; overflow:hidden;
          left:0px; top:0px; width:24px; height:24px;
          background:url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg width='24px' height='24px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 17.0001H12.01M12 10.0001V14.0001M6.41209 21.0001H17.588C19.3696 21.0001 20.2604 21.0001 20.783 20.6254C21.2389 20.2985 21.5365 19.7951 21.6033 19.238C21.6798 18.5996 21.2505 17.819 20.3918 16.2579L14.8039 6.09805C13.8897 4.4359 13.4326 3.60482 12.8286 3.32987C12.3022 3.09024 11.6978 3.09024 11.1714 3.32987C10.5674 3.60482 10.1103 4.4359 9.19614 6.09805L3.6082 16.2579C2.74959 17.819 2.32028 18.5996 2.39677 19.238C2.46351 19.7951 2.76116 20.2985 3.21709 20.6254C3.7396 21.0001 4.63043 21.0001 6.41209 21.0001Z' stroke='orange' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='white'/%3E%3C/svg%3E");
          pointer-events:auto;
        }
      </style>
      <div class="RSC-ErrorIndicator" onClick=${onClick}></div>
    `;
    }
    /**** showErrorInfoForVisual ****/
    function showErrorInfoForVisual(Visual) {
        const { Title, Message } = ErrorOfVisual(Visual);
        window.alert(Title + '\n\n' + Message);
    }
    //------------------------------------------------------------------------------
    //--                                RSC_Visual                                --
    //------------------------------------------------------------------------------
    const ShadowRootForVisual = new WeakMap();
    const AttributeChangeHandlerForVisual = new WeakMap();
    const AttachmentHandlerForVisual = new WeakMap();
    const DetachmentHandlerForVisual = new WeakMap();
    const RendererForVisual = new WeakMap();
    const DummyHandler = () => { };
    class RSC_Visual extends HTMLElement {
        /**** constructor ****/
        constructor() {
            super();
            const ShadowRoot = this.attachShadow({ mode: 'closed' });
            ShadowRootForVisual.set(this, ShadowRoot);
        }
        /**** connectedCallback - elements are added from the outside in ****/
        connectedCallback() {
            validateContainerOfVisual(this); // throws if inacceptable for container
            if (VisualWasInitialized(this)) {
                unregisterAllReactiveAttributesOfVisual(this);
                registerAllReactiveAttributesOfVisual(this);
            }
            else {
                registerAllBehavioursFoundInVisual(this);
                registerAllDelegatedScriptsFoundInVisual(this);
                validateContentsOfVisual(this);
                applyBehaviourScriptOfVisual(this);
                applyElementScriptOfVisual(this);
                updateAllAttributesOfVisual(this); // setters should be defined by now
                registerAllReactiveAttributesOfVisual(this);
                markVisualAsInitialized(this); // outer visuals are now known
            }
            startReactiveRenderingOfVisual(this); // also renders now
            let AttachmentHandler = AttachmentHandlerForVisual.get(this);
            if (AttachmentHandler != null) {
                try {
                    AttachmentHandler.call(this);
                }
                catch (Signal) {
                    setErrorOfVisual(this, {
                        Title: 'Attachment Handler Failure',
                        Message: 'Running the configured attachment handler failed\n\n' +
                            'Reason: ' + Signal
                    });
                }
            }
        }
        /**** disconnectedCallback - elements are removed from the outside in ****/
        disconnectedCallback() {
            startReactiveRenderingOfVisual(this);
            //    unregisterAllReactiveFunctionsFrom(this) // TODO: better before removal
            unregisterAllReactiveAttributesOfVisual(this);
            let DetachmentHandler = DetachmentHandlerForVisual.get(this);
            if (DetachmentHandler != null) {
                try {
                    DetachmentHandler.call(this);
                }
                catch (Signal) {
                    setErrorOfVisual(this, {
                        Title: 'Detachment Handler Failure',
                        Message: 'Running the configured detachment handler failed\n\n' +
                            'Reason: ' + Signal
                    });
                }
            }
        }
        /**** attributeChangedCallback ****/
        attributeChangedCallback(normalizedName, oldValue, newValue) {
            if (VisualWasInitialized(this) && !ValueIsReactiveAttributeName(normalizedName)) {
                updateAttributeOfVisual(this, normalizedName, newValue);
            }
        }
        /**** observed ****/
        get observed() { return ObservableOfVisual(this); }
        set observed(_) { throwReadOnlyError('observable'); }
        /**** unobserved ****/
        get unobserved() { return UnobservedOfVisual(this); }
        set unobserved(_) { throwReadOnlyError('unobserved'); }
        /**** onAttributeChange (originalName, newValue) ****/
        onAttributeChange(newHandler) {
            expectFunction('visual attribute change handler', newHandler);
            AttributeChangeHandlerForVisual.set(this, newHandler);
        }
        /**** onAttachment () ****/
        onAttachment(newHandler) {
            expectFunction('visual attachment handler', newHandler);
            AttachmentHandlerForVisual.set(this, newHandler);
        }
        /**** onDetachment () ****/
        onDetachment(newHandler) {
            expectFunction('visual detachment handler', newHandler);
            DetachmentHandlerForVisual.set(this, newHandler) || DummyHandler;
        }
        /**** Renderer ****/
        toRender(newHandler) {
            expectFunction('visual renderer', newHandler);
            RendererForVisual.set(this, newHandler);
        }
        /**** render ****/
        render() {
            if (VisualWasInitialized(this)) {
                let Rendering;
                if (!this.hasError) {
                    const Renderer = RendererForVisual.get(this);
                    if (Renderer == null) {
                        if (this.tagName === 'RSC-VISUAL') {
                            Rendering = html `${this.observed['Value']}<slot/>`;
                        }
                    }
                    else {
                        try {
                            Rendering = Renderer.call(this);
                        }
                        catch (Signal) {
                            setErrorOfVisual(this, {
                                Title: 'Rendering Failure',
                                Message: 'Running the configured renderer failed, reason: ' + Signal
                            });
                        }
                    }
                }
                const ShadowRoot = ShadowRootForVisual.get(this);
                if (this.hasError) {
                    render(html `<${RSC_ErrorIndicator} visual=${this}/>`, ShadowRoot);
                }
                else {
                    render(html `${Rendering}`, ShadowRoot);
                }
            }
        }
        /**** hasError ****/
        get hasError() { return (this.Error != null); }
        set hasError(_) { throwReadOnlyError('hasError'); }
        /**** Error ****/
        get Error() {
            return ErrorOfVisual(this);
        }
        set Error(ErrorInfo) {
            setErrorOfVisual(this, ErrorInfo);
        }
    }
    RSC_Visual.observedAttributes = ['value']; // may be overwritten
    customElements.define('rsc-visual', RSC_Visual);
    registerAllBehavioursFoundInHead();
})(RSC || (RSC = {}));
//# sourceMappingURL=reactive-scriptable-components.esm.js.map
