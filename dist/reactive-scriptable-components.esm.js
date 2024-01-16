import * as JIL from 'javascript-interface-library';
import { ValidatorForClassifier, acceptNil, rejectNil, expectFunction, throwError, quoted, ValueIsStringMatching, ValueIsObject, ValueIsTextline, ValueIsText, ValueIsBoolean, ValueIsNumber, ValueIsNumberInRange, ValueIsInteger, ValueIsIntegerInRange, ValueIsString, ValueIsURL, expectTextline, ValueIsListSatisfying, expectedTextline, allowListSatisfying, ValueIsFunction, ValueIsArray, ObjectIsEmpty } from 'javascript-interface-library';
import { html } from 'htm/preact';
import { render } from 'preact';
import hyperactiv from 'hyperactiv';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/*******************************************************************************
*                                                                              *
*           Reactive Scriptable Components (RSC, pronounced "resc")            *
*                                                                              *
*******************************************************************************/
var observe = hyperactiv.observe, computed = hyperactiv.computed, dispose = hyperactiv.dispose;
/**** hide all undefined custom elements (to avoid initial flashing) ****/
var Stylesheet = document.createElement('style');
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
    var RSC_NamePattern = /^[a-z$_][a-z$_0-9]*(-[a-z$_0-9]+)*$/i;
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
    function acceptableNumberInRange(Value, Default, minValue, maxValue, withMin, withMax) {
        if (minValue === void 0) { minValue = -Infinity; }
        if (maxValue === void 0) { maxValue = Infinity; }
        if (withMin === void 0) { withMin = false; }
        if (withMax === void 0) { withMax = false; }
        return (ValueIsNumberInRange(Value, minValue, maxValue, withMin, withMax) ? Value : Default);
    }
    RSC.acceptableNumberInRange = acceptableNumberInRange;
    /**** acceptableInteger ****/
    function acceptableInteger(Value, Default) {
        return (ValueIsInteger(Value) ? Value : Default);
    }
    RSC.acceptableInteger = acceptableInteger;
    /**** acceptableIntegerInRange ****/
    function acceptableIntegerInRange(Value, Default, minValue, maxValue) {
        if (minValue === void 0) { minValue = -Infinity; }
        if (maxValue === void 0) { maxValue = Infinity; }
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
    var InitializationMarkerForVisual = new WeakMap();
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
        var outermostVisual = undefined;
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
        var normalizedName = BehaviourName.toLowerCase();
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
        var innerVisuals = Array.from(DOMElement.children)
            .filter(function (innerElement) { return ValueIsVisual(innerElement); });
        return innerVisuals;
    }
    RSC.innerVisualsOf = innerVisualsOf;
    /**** Behaviours are global ****/
    var BehaviourRegistry = Object.create(null);
    /**** InfoForBehaviour ****/
    function InfoForBehaviour(Name) {
        return BehaviourRegistry[Name.toLowerCase()];
    }
    /**** registerBehaviour ****/
    function registerBehaviour(Name, SourceOrExecutable, observedAttributes) {
        var _a;
        if (observedAttributes === void 0) { observedAttributes = []; }
        var normalizedName = Name.toLowerCase();
        allowListSatisfying('list of observed element attributes', observedAttributes, ValueIsName);
        var AttributeSet = Object.create(null);
        if (observedAttributes != null) {
            observedAttributes.forEach(function (Name) { return AttributeSet[Name.toLowerCase()] = Name; });
            observedAttributes = observedAttributes.map(function (Name) { return Name.toLowerCase(); });
        }
        if (ValueIsFunction(SourceOrExecutable)) {
            BehaviourRegistry[normalizedName] = {
                Name: Name,
                AttributeSet: AttributeSet,
                Executable: SourceOrExecutable
            };
        }
        else {
            if (normalizedName in BehaviourRegistry) {
                var BehaviourInfo = BehaviourRegistry[normalizedName];
                if (BehaviourInfo.Source == null)
                    throwError('ForbiddenOperation: cannot overwrite intrinsic behaviour ' + quoted(Name));
                if (BehaviourInfo.Source.trim() !== SourceOrExecutable.trim())
                    throwError('ForbiddenOperation: cannot overwrite existing behaviour ' + quoted(Name));
            }
            else {
                var Source = SourceOrExecutable;
                var Executable = void 0;
                try {
                    Executable = compiledScript(Source);
                }
                catch (Signal) {
                    console.error("CompilationError: compilation of behaviour ".concat(quoted(Name), " failed. ") +
                        'Reason: ' + Signal);
                    BehaviourRegistry[normalizedName] = {
                        Name: Name,
                        AttributeSet: AttributeSet,
                        Source: Source,
                        Error: {
                            Title: 'Compilation Failure',
                            Message: "Compilation of behaviour ".concat(quoted(Name), " failed.\n\n") +
                                'Reason:' + Signal
                        }
                    };
                    return;
                }
                BehaviourRegistry[normalizedName] = {
                    Name: Name,
                    AttributeSet: AttributeSet,
                    Source: Source,
                    Executable: Executable
                };
            }
        }
        /**** install a custom element for the given behaviour ****/
        var customizedVisual = (_a = /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return class_1;
            }(RSC_Visual)),
            _a.observedAttributes = observedAttributes,
            _a);
        customElements.define('rsc-' + normalizedName, customizedVisual);
    }
    BehaviourRegistry['visual'] = {
        Name: 'Visual', AttributeSet: { value: 'Value' }
    };
    /**** registerBehaviourFromElement ****/
    function registerBehaviourFromElement(ScriptElement) {
        var Name = RSC.expectedName('behaviour name', ScriptElement.getAttribute('for-behaviour'));
        if (Name.toLowerCase() === 'visual')
            throwError('ReservedName: behaviour name "visual" is reserved for internal use');
        var Source = ScriptElement.innerHTML;
        var observedAttributes = ((ScriptElement.getAttribute('observed-attributes') || '')
            .split(/\s*(?:,|$)\s*/).filter(function (Name) { return (Name || '').trim() !== ''; }));
        if (!ValueIsListSatisfying(observedAttributes, ValueIsName))
            throwError('Invalidargument: attribute "observed-attributes" does not contain a ' +
                'list of valid RSC attribute names');
        registerBehaviour(Name, Source, observedAttributes);
        permitVisualsWithinBehaviour(Name, ScriptElement.getAttribute('permitted-contents') || '');
        forbidVisualsWithinBehaviour(Name, ScriptElement.getAttribute('fobidden-contents') || '');
    }
    /**** registerAllBehavioursFoundInHead ****/
    function registerAllBehavioursFoundInHead() {
        innerElementsOf(document.head).forEach(function (Element) {
            if (Element.matches('script[type="rsc-script"][for-behaviour]')) {
                registerBehaviourFromElement(Element);
            }
        });
    }
    /**** registerAllBehavioursFoundInVisual ****/
    function registerAllBehavioursFoundInVisual(Visual) {
        innerElementsOf(Visual).forEach(function (Element) {
            if (Element.matches('script[type="rsc-script"][for-behaviour]')) {
                registerBehaviourFromElement(Element);
            }
        });
    }
    //registerAllBehavioursFoundInHead()           // not yet, only after RSC_Visual
    /**** BehaviourNameOfVisual ****/
    function BehaviourNameOfVisual(Visual) {
        var _a;
        var BehaviourName = Visual.tagName.slice(4).toLowerCase();
        if (BehaviourName === 'visual') {
            BehaviourName = Visual.getAttribute('behaviour');
            return (ValueIsName(BehaviourName) ? BehaviourName : 'visual');
        }
        else {
            return ((_a = InfoForBehaviour(BehaviourName)) === null || _a === void 0 ? void 0 : _a.Name) || BehaviourName;
        }
    }
    var permittedVisualsSelectorWithinBehaviour = Object.create(null);
    var forbiddenVisualsSelectorWithinBehaviour = Object.create(null);
    /**** permitVisualsWithinBehaviour ****/
    function permitVisualsWithinBehaviour(BehaviourName, Selector) {
        Selector = Selector.trim();
        if (Selector !== '') {
            var normalizedBehaviourName = BehaviourName.toLowerCase();
            permittedVisualsSelectorWithinBehaviour[normalizedBehaviourName] = Selector;
        }
    }
    /**** forbidVisualsWithinBehaviour ****/
    function forbidVisualsWithinBehaviour(BehaviourName, Selector) {
        Selector = Selector.trim();
        if (Selector !== '') {
            var normalizedBehaviourName = BehaviourName.toLowerCase();
            forbiddenVisualsSelectorWithinBehaviour[normalizedBehaviourName] = Selector;
        }
    }
    /**** validateContentsOfVisual ****/
    function validateContentsOfVisual(Visual) {
        var BehaviourName = BehaviourNameOfVisual(Visual);
        if (BehaviourName == null) {
            return;
        }
        var normalizedBehaviourName = BehaviourName.toLowerCase();
        var permittedVisualsSelector = permittedVisualsSelectorWithinBehaviour[normalizedBehaviourName];
        var forbiddenVisualsSelector = forbiddenVisualsSelectorWithinBehaviour[normalizedBehaviourName];
        if ((permittedVisualsSelector != null) || (forbiddenVisualsSelector != null)) {
            innerVisualsOf(Visual).forEach(function (innerVisual) {
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
        var Container = outerVisualOf(Visual);
        if (Container == null) {
            return;
        }
        var BehaviourName = BehaviourNameOfVisual(Container);
        if (BehaviourName == null) {
            return;
        }
        var normalizedBehaviourName = BehaviourName.toLowerCase();
        var permittedVisualsSelector = permittedVisualsSelectorWithinBehaviour[normalizedBehaviourName];
        if (permittedVisualsSelector != null) {
            if (!Visual.matches(permittedVisualsSelector))
                throwError('InacceptableInnerVisual: the given visual is not allowed to become a ' +
                    'part of its container');
        }
        var forbiddenVisualsSelector = forbiddenVisualsSelectorWithinBehaviour[normalizedBehaviourName];
        if (forbiddenVisualsSelector != null) {
            if (Visual.matches(forbiddenVisualsSelector))
                throwError('InacceptableInnerVisual: the given visual is not allowed to become a ' +
                    'part of its container');
        }
    }
    var ScriptDelegationSetForVisual = new WeakMap();
    /**** registerDelegatedScriptInVisual ****/
    function registerDelegatedScriptInVisual(Visual, Selector, Source) {
        var ScriptDelegationSet = ScriptDelegationSetForVisual.get(Visual);
        if (ScriptDelegationSet == null) {
            ScriptDelegationSetForVisual.set(Visual, ScriptDelegationSet = Object.create(null));
        }
        if (Selector in ScriptDelegationSet)
            throwError('ForbiddenOperation: a script for elements matching selector ' +
                quoted(Selector) + ' exists already');
        var Executable;
        try {
            Executable = compiledScript(Source);
        }
        catch (Signal) {
            throwError('CompilationError: compilation of delegated script for elements ' +
                'matching selector ' + quoted(Selector) + ' failed. ' +
                'Reason: ' + Signal);
        }
        ScriptDelegationSet[Selector] = { Selector: Selector, Source: Source, Executable: Executable };
    }
    /**** registerDelegatedScriptFromElement ****/
    function registerDelegatedScriptFromElement(Visual, ScriptElement) {
        var Selector = expectedTextline('element selector', ScriptElement.getAttribute('for'));
        var Script = ScriptElement.innerHTML;
        registerDelegatedScriptInVisual(Visual, Selector, Script);
    }
    /**** registerAllDelegatedScriptsFoundInVisual ****/
    function registerAllDelegatedScriptsFoundInVisual(Visual) {
        innerElementsOf(Visual).forEach(function (Element) {
            if (Element.matches('script[type="rsc-script"][for]')) {
                registerDelegatedScriptFromElement(Visual, Element);
            }
        });
    }
    /**** delegatedScriptInfoForVisual ****/
    function delegatedScriptInfoForVisual(Visual) {
        var ScriptContainer = Visual;
        while (ScriptContainer != null) {
            var ScriptDelegationSet = ScriptDelegationSetForVisual.get(ScriptContainer);
            if (ScriptDelegationSet != null) {
                for (var Selector in ScriptDelegationSet) {
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
        var Script = Visual.getAttribute('script') || '';
        return (Script.trim() === '' ? undefined : Script);
    }
    /**** ScriptInVisual ****/
    function ScriptInVisual(Visual) {
        var ScriptList = innerElementsOf(Visual);
        for (var i = 0, l = ScriptList.length; i < l; i++) {
            var Candidate = ScriptList[i];
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
        var onAttributeChange = Visual.onAttributeChange.bind(Visual);
        var onAttachment = Visual.onAttachment.bind(Visual);
        var onDetachment = Visual.onDetachment.bind(Visual);
        var toRender = Visual.toRender.bind(Visual);
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
            var ArgList = Array.prototype.slice.call(arguments, 1);
            Events = (Events || '').trim().replace(/\s+/g, ' ');
            if (Events === '') {
                unregisterAllMatchingEventHandlersFromVisual(Visual);
                return;
            }
            var Selector = (ValueIsString(ArgList[0])
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
        function trigger(EventToTrigger, Arguments, bubbles) {
            if (bubbles === void 0) { bubbles = true; }
            Arguments = (ValueIsArray(Arguments) ? Arguments.slice() : []);
            switch (true) {
                case ValueIsString(EventToTrigger):
                    EventToTrigger = new CustomEvent(EventToTrigger, {
                        bubbles: bubbles,
                        cancelable: true, detail: { Arguments: Arguments }
                    });
                    break;
                case (EventToTrigger instanceof Event):
                    EventToTrigger = new CustomEvent(EventToTrigger.type, Object.assign({}, EventToTrigger, {
                        bubbles: bubbles,
                        cancelable: true, detail: { Arguments: Arguments }
                    }));
                    break;
                default:
                    debugger;
                    throwError('InvalidArgument: Event instance or literal event type expected');
            }
            Visual.dispatchEvent(EventToTrigger);
            var EventDetails = EventToTrigger.detail;
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
        var BehaviourName = BehaviourNameOfVisual(Visual);
        if (BehaviourName == null) {
            return;
        }
        var BehaviourInfo = InfoForBehaviour(BehaviourName);
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
        var Executable = BehaviourInfo.Executable;
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
        var Script = ScriptOfVisual(Visual) || ScriptInVisual(Visual);
        if (Script != null) {
            var Executable = void 0;
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
        var ScriptDelegationInfo = delegatedScriptInfoForVisual(Visual);
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
    var RSC_NameWithSelectorPattern = /^[a-z$_][a-z$_0-9]*([-.:][a-z$_0-9]+)*@.*$/i;
    function ValueIsEventNameWithSelector(Value) {
        return ValueIsStringMatching(Value, RSC_NameWithSelectorPattern);
    }
    /**** registerEventHandlerForVisual ****/
    function registerEventHandlerForVisual(Visual, Events, SelectorOrHandler, DataOrHandler, Handler, once) {
        var ArgList = Array.prototype.slice.call(arguments, 1);
        Events = ArgList.shift().trim().replace(/\s+/g, ' ');
        if (Events === '') {
            return;
        }
        var Selector = (ValueIsString(ArgList[0])
            ? ArgList.shift().trim()
            : (ArgList[0] == null ? ArgList.shift() || '' : '')); // '' means: no selector
        var Data = (typeof ArgList[1] === 'function'
            ? ArgList.shift()
            : undefined);
        Handler = ArgList.shift();
        _registerEventHandlerForVisual(Visual, Events, Selector, Data, Handler, once);
    }
    /**** _registerEventHandlerForVisual ****/
    var EventRegistryForVisual = new WeakMap();
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
            var ArgList = [Event].concat(((_a = Event.detail) === null || _a === void 0 ? void 0 : _a.Arguments) || []);
            try {
                var Result = Handler.apply(Visual, ArgList);
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
        var EventList;
        if (ValueIsEventNameWithSelector(Events)) {
            var AtIndex = Events.indexOf('@');
            EventList = [Events.slice(0, AtIndex)];
            Selector = Events.slice(AtIndex + 1);
            if (Selector === 'this') {
                Selector = '@this';
            } // special case
        }
        else {
            EventList = Events.split(' ');
        }
        var EventRegistry = EventRegistryForVisual.get(Visual);
        if (EventRegistry == null) {
            EventRegistryForVisual.set(Visual, EventRegistry = Object.create(null));
        }
        EventList.forEach(function (Event) {
            var EntriesForEvent = EventRegistry[Event];
            if (EntriesForEvent == null) {
                EntriesForEvent = EventRegistry[Event] = Object.create(null);
            }
            var EntriesForSelector = EntriesForEvent[Selector];
            if (EntriesForSelector == null) {
                EntriesForSelector = EntriesForEvent[Selector] = [];
            }
            EntriesForSelector.push(actualHandler);
            Visual.addEventListener(Event, actualHandler);
        });
    }
    /**** unregisterAllMatchingEventHandlersFromVisual ****/
    function unregisterAllMatchingEventHandlersFromVisual(Visual, Events, Selector, Handler) {
        var EventList;
        if (ValueIsEventNameWithSelector(Events)) {
            var AtIndex = Events.indexOf('@');
            EventList = [Events.slice(0, AtIndex)];
            Selector = Events.slice(AtIndex + 1);
        }
        else {
            EventList = (Events == null ? [] : Events.split(' '));
        }
        var EventRegistry = EventRegistryForVisual.get(Visual);
        if (EventRegistry == null) {
            return;
        }
        if (EventList.length === 0) { // unregister any event handlers
            for (var Event_1 in EventRegistry) {
                unregisterMatchingEventHandlersFromVisual(Visual, Event_1, Selector, Handler);
            }
        }
        else { // unregister handlers for the given events only
            EventList.forEach(function (Event) {
                unregisterMatchingEventHandlersFromVisual(Visual, Event, Selector, Handler);
            });
        }
    }
    /**** unregisterMatchingEventHandlersFromVisual ****/
    function unregisterMatchingEventHandlersFromVisual(Visual, Event, Selector, Handler) {
        var EventRegistry = EventRegistryForVisual.get(Visual);
        if (EventRegistry == null) {
            return;
        }
        var EntriesForEvent = EventRegistry[Event];
        if (EntriesForEvent != null) {
            if (Selector == null) {
                for (var Selector_1 in EntriesForEvent) {
                    unregisterMatchingEventSelectorHandlersFromVisual(Visual, EntriesForEvent, Event, Selector_1, Handler);
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
        var EntriesForSelector = EntriesForEvent[Selector];
        if (EntriesForSelector != null) {
            if (Handler == null) {
                EntriesForSelector.forEach(function (actualHandler) {
                    // @ts-ignore TypeScript does not allow JS functions here, but that's wrong
                    Visual.removeEventListener(Event, actualHandler);
                });
                EntriesForSelector.length = 0;
            }
            else {
                EntriesForSelector.every(function (actualHandler, Index) {
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
    var reactiveFunctionsForVisual = new WeakMap();
    var reactiveAttributesForVisual = new WeakMap();
    /**** ObservableOfVisual ****/
    var ObservableForVisual = new WeakMap();
    function ObservableOfVisual(Visual) {
        var Observable = ObservableForVisual.get(Visual);
        if (Observable == null) {
            ObservableForVisual.set(Visual, Observable = observe({}, { deep: false }));
        }
        return Observable;
    }
    /**** UnobservedOfVisual ****/
    var UnobservedForVisual = new WeakMap();
    function UnobservedOfVisual(Visual) {
        var Unobserved = UnobservedForVisual.get(Visual);
        if (Unobserved == null) {
            UnobservedForVisual.set(Visual, Unobserved = {});
        }
        return Unobserved;
    }
    /**** startReactiveRenderingOfVisual ****/
    var reactiveRendererForVisual = new WeakMap();
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
        var AttributeChangeHandler = AttributeChangeHandlerForVisual.get(Visual);
        if (AttributeChangeHandler == null) {
            var BehaviourName = BehaviourNameOfVisual(Visual);
            if (BehaviourName == null) {
                return;
            }
            var Behaviour = InfoForBehaviour(BehaviourName);
            if (Behaviour == null) {
                return;
            }
            var AttributeSet = Behaviour.AttributeSet;
            if (normalizedName in AttributeSet) {
                var originalName = AttributeSet[normalizedName];
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
        Array.from(Visual.attributes).forEach(function (Attribute) {
            var normalizedName = Attribute.name;
            if (ValueIsName(normalizedName)) { // ignores all reactive attributes
                updateAttributeOfVisual(Visual, normalizedName, Attribute.value);
            }
        });
    }
    /**** registerAllReactiveAttributesOfVisual ****/
    function registerAllReactiveAttributesOfVisual(Visual) {
        Array.from(Visual.attributes).forEach(function (Attribute) {
            var reactiveName = Attribute.name;
            if (ValueIsReactiveAttributeName(reactiveName)) {
                var BehaviourName = BehaviourNameOfVisual(Visual);
                if (BehaviourName == null) {
                    return;
                }
                var Behaviour = InfoForBehaviour(BehaviourName);
                if (Behaviour == null) {
                    return;
                }
                var normalizedName = reactiveName.replace(/^[$]{1,2}/, '');
                var AttributeSet = Behaviour.AttributeSet;
                if (normalizedName in AttributeSet) {
                    var originalName_1 = AttributeSet[normalizedName];
                    var _a = parsedAccessPathFromVisual(Visual, Attribute.value), Base_1 = _a.Base, PathList_1 = _a.PathList;
                    var HandlerList = reactiveAttributesForVisual.get(Visual);
                    if (HandlerList == null) {
                        reactiveAttributesForVisual.set(Visual, HandlerList = []);
                    }
                    if (reactiveName.startsWith('$$')) {
                        var Handler_1 = computed(function () {
                            setValueOfReactiveVariable(Base_1, PathList_1, Visual.observed[originalName_1]);
                        });
                        HandlerList.push(Handler_1);
                    }
                    var Handler = computed(function () {
                        Visual.observed[originalName_1] = ValueOfReactiveVariable(Base_1, PathList_1);
                    });
                    HandlerList.push(Handler);
                }
            }
        });
    }
    var dottedIndexPattern = /^\s*[.]([^.\[]+)/;
    var unquotedIndexPattern = /^\s*\[([^'"\]]+)\]/;
    var sglquotedIndexPattern = /^\s*\[\s*'(([^'\\]|\\(["'\\\/bfnrt]|x[0-9a-f]{2}|u[0-9a-f]{4}))*)'\s*\]/i;
    var dblquotedIndexPattern = /^\s*\[\s*"(([^"\\]|\\(["'\\\/bfnrt]|x[0-9a-f]{2}|u[0-9a-f]{4}))*)"\s*\]/i;
    function parsedAccessPathFromVisual(Visual, literalPath) {
        var SplitIndex = literalPath.indexOf(':observed');
        if (SplitIndex < 0)
            throwError('InvalidAccessPath:invalid access path ' + quoted(literalPath));
        var Selector = literalPath.slice(0, SplitIndex);
        if (ValueIsName(Selector)) {
            var normalizedName = Selector.toLowerCase();
            Selector = "rsc-".concat(normalizedName, ",[behaviour=\"").concat(normalizedName, "\"]");
        }
        var Base = closestVisualMatching(Visual, Selector);
        if (Base == null)
            throwError('NoSuchVisual:could not find a close visual matching CSS selector' +
                quoted(Selector));
        var AccessPath = literalPath.slice(SplitIndex + 9).trim();
        var PathList = [];
        var Match;
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
        return { Base: Base, PathList: PathList };
    }
    /**** ValueOfReactiveVariable ****/
    function ValueOfReactiveVariable(Base, PathList) {
        var Value = Base.observed[PathList[0]];
        for (var i = 1, l = PathList.length; i < l; i++) {
            if (Value == null)
                throwError('InvalidAccess:cannot access variable bound to reactive attribute');
            Value = Value[PathList[i]];
        }
        return Value;
    }
    /**** setValueOfReactiveVariable ****/
    function setValueOfReactiveVariable(Base, PathList, Value) {
        var Variable = Base;
        for (var i = 0, l = PathList.length - 1; i < l; i++) {
            if (Variable == null)
                throwError('InvalidAccess:cannot access variable bound to reactive attribute');
            Variable = Variable[PathList[i]];
        }
        Variable[PathList[-1]] = Value;
    }
    /**** unregisterAllReactiveAttributesOfVisual ****/
    function unregisterAllReactiveAttributesOfVisual(Visual) {
        var HandlerList = reactiveAttributesForVisual.get(Visual);
        if (HandlerList == null) {
            return;
        }
        HandlerList.forEach(function (Handler) {
            dispose(Handler);
        });
    }
    /**** registerReactiveFunctionIn ****/
    function registerReactiveFunctionIn(Visual, reactiveFunction) {
        var reactiveFunctions = reactiveFunctionsForVisual.get(Visual);
        if (reactiveFunctions == null) {
            reactiveFunctionsForVisual.set(Visual, reactiveFunctions = []);
        }
        reactiveFunctions.push(reactiveFunction);
    }
    var ErrorInfoForVisual = new WeakMap();
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
        var Visual = PropSet.visual;
        function onClick(Event) {
            showErrorInfoForVisual(Visual);
        }
        return html(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      <style>\n        .RSC-ErrorIndicator {\n          display:block; position:absolute; overflow:hidden;\n          left:0px; top:0px; width:24px; height:24px;\n          background:url(\"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg width='24px' height='24px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 17.0001H12.01M12 10.0001V14.0001M6.41209 21.0001H17.588C19.3696 21.0001 20.2604 21.0001 20.783 20.6254C21.2389 20.2985 21.5365 19.7951 21.6033 19.238C21.6798 18.5996 21.2505 17.819 20.3918 16.2579L14.8039 6.09805C13.8897 4.4359 13.4326 3.60482 12.8286 3.32987C12.3022 3.09024 11.6978 3.09024 11.1714 3.32987C10.5674 3.60482 10.1103 4.4359 9.19614 6.09805L3.6082 16.2579C2.74959 17.819 2.32028 18.5996 2.39677 19.238C2.46351 19.7951 2.76116 20.2985 3.21709 20.6254C3.7396 21.0001 4.63043 21.0001 6.41209 21.0001Z' stroke='orange' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='white'/%3E%3C/svg%3E\");\n          pointer-events:auto;\n        }\n      </style>\n      <div class=\"RSC-ErrorIndicator\" onClick=", "></div>\n    "], ["\n      <style>\n        .RSC-ErrorIndicator {\n          display:block; position:absolute; overflow:hidden;\n          left:0px; top:0px; width:24px; height:24px;\n          background:url(\"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg width='24px' height='24px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 17.0001H12.01M12 10.0001V14.0001M6.41209 21.0001H17.588C19.3696 21.0001 20.2604 21.0001 20.783 20.6254C21.2389 20.2985 21.5365 19.7951 21.6033 19.238C21.6798 18.5996 21.2505 17.819 20.3918 16.2579L14.8039 6.09805C13.8897 4.4359 13.4326 3.60482 12.8286 3.32987C12.3022 3.09024 11.6978 3.09024 11.1714 3.32987C10.5674 3.60482 10.1103 4.4359 9.19614 6.09805L3.6082 16.2579C2.74959 17.819 2.32028 18.5996 2.39677 19.238C2.46351 19.7951 2.76116 20.2985 3.21709 20.6254C3.7396 21.0001 4.63043 21.0001 6.41209 21.0001Z' stroke='orange' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='white'/%3E%3C/svg%3E\");\n          pointer-events:auto;\n        }\n      </style>\n      <div class=\"RSC-ErrorIndicator\" onClick=", "></div>\n    "])), onClick);
    }
    /**** showErrorInfoForVisual ****/
    function showErrorInfoForVisual(Visual) {
        var _a = ErrorOfVisual(Visual), Title = _a.Title, Message = _a.Message;
        window.alert(Title + '\n\n' + Message);
    }
    //------------------------------------------------------------------------------
    //--                                RSC_Visual                                --
    //------------------------------------------------------------------------------
    var ShadowRootForVisual = new WeakMap();
    var AttributeChangeHandlerForVisual = new WeakMap();
    var AttachmentHandlerForVisual = new WeakMap();
    var DetachmentHandlerForVisual = new WeakMap();
    var RendererForVisual = new WeakMap();
    var DummyHandler = function () { };
    var RSC_Visual = /** @class */ (function (_super) {
        __extends(RSC_Visual, _super);
        /**** constructor ****/
        function RSC_Visual() {
            var _this = _super.call(this) || this;
            var ShadowRoot = _this.attachShadow({ mode: 'closed' });
            ShadowRootForVisual.set(_this, ShadowRoot);
            return _this;
        }
        /**** connectedCallback - elements are added from the outside in ****/
        RSC_Visual.prototype.connectedCallback = function () {
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
            var AttachmentHandler = AttachmentHandlerForVisual.get(this);
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
        };
        /**** disconnectedCallback - elements are removed from the outside in ****/
        RSC_Visual.prototype.disconnectedCallback = function () {
            startReactiveRenderingOfVisual(this);
            //    unregisterAllReactiveFunctionsFrom(this) // TODO: better before removal
            unregisterAllReactiveAttributesOfVisual(this);
            var DetachmentHandler = DetachmentHandlerForVisual.get(this);
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
        };
        /**** attributeChangedCallback ****/
        RSC_Visual.prototype.attributeChangedCallback = function (normalizedName, oldValue, newValue) {
            if (VisualWasInitialized(this) && !ValueIsReactiveAttributeName(normalizedName)) {
                updateAttributeOfVisual(this, normalizedName, newValue);
            }
        };
        Object.defineProperty(RSC_Visual.prototype, "observed", {
            /**** observed ****/
            get: function () { return ObservableOfVisual(this); },
            set: function (_) { throwReadOnlyError('observable'); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(RSC_Visual.prototype, "unobserved", {
            /**** unobserved ****/
            get: function () { return UnobservedOfVisual(this); },
            set: function (_) { throwReadOnlyError('unobserved'); },
            enumerable: false,
            configurable: true
        });
        /**** onAttributeChange (originalName, newValue) ****/
        RSC_Visual.prototype.onAttributeChange = function (newHandler) {
            expectFunction('visual attribute change handler', newHandler);
            AttributeChangeHandlerForVisual.set(this, newHandler);
        };
        /**** onAttachment () ****/
        RSC_Visual.prototype.onAttachment = function (newHandler) {
            expectFunction('visual attachment handler', newHandler);
            AttachmentHandlerForVisual.set(this, newHandler);
        };
        /**** onDetachment () ****/
        RSC_Visual.prototype.onDetachment = function (newHandler) {
            expectFunction('visual detachment handler', newHandler);
            DetachmentHandlerForVisual.set(this, newHandler) || DummyHandler;
        };
        /**** Renderer ****/
        RSC_Visual.prototype.toRender = function (newHandler) {
            expectFunction('visual renderer', newHandler);
            RendererForVisual.set(this, newHandler);
        };
        /**** render ****/
        RSC_Visual.prototype.render = function () {
            if (VisualWasInitialized(this)) {
                var Rendering = void 0;
                if (!this.hasError) {
                    var Renderer = RendererForVisual.get(this);
                    if (Renderer == null) {
                        if (this.tagName === 'RSC-VISUAL') {
                            Rendering = html(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", "<slot/>"], ["", "<slot/>"])), this.observed['Value']);
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
                var ShadowRoot_1 = ShadowRootForVisual.get(this);
                if (this.hasError) {
                    render(html(templateObject_3 || (templateObject_3 = __makeTemplateObject(["<", " visual=", "/>"], ["<", " visual=", "/>"])), RSC_ErrorIndicator, this), ShadowRoot_1);
                }
                else {
                    render(html(templateObject_4 || (templateObject_4 = __makeTemplateObject(["", ""], ["", ""])), Rendering), ShadowRoot_1);
                }
            }
        };
        Object.defineProperty(RSC_Visual.prototype, "hasError", {
            /**** hasError ****/
            get: function () { return (this.Error != null); },
            set: function (_) { throwReadOnlyError('hasError'); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(RSC_Visual.prototype, "Error", {
            /**** Error ****/
            get: function () {
                return ErrorOfVisual(this);
            },
            set: function (ErrorInfo) {
                setErrorOfVisual(this, ErrorInfo);
            },
            enumerable: false,
            configurable: true
        });
        RSC_Visual.observedAttributes = ['value']; // may be overwritten
        return RSC_Visual;
    }(HTMLElement));
    customElements.define('rsc-visual', RSC_Visual);
    registerAllBehavioursFoundInHead();
})(RSC || (RSC = {}));
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=reactive-scriptable-components.esm.js.map
