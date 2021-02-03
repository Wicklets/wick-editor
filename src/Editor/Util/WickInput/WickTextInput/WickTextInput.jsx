import React, { useState, useEffect } from 'react';

let classNames = require('classnames');

/**
 * A delayed text input object that will not the provided on change unless the value is valid, and 
 * passes a provided isValid function.
 * 
 * @param {Object} props 
 * * @param {function} isValid - returns true if the value provided is acceptable, false otherwise. If no isValid function is provided, 
 * * @param {RegExp} isValidRegex - a regular expression to check against for validity.
 * * @param {function} cleanUp - Valid values will be passed to this function prior to being displayed, and sent to the onChange function.
 */

export default function WickTextInput (props) {

    const [displayValue, setDisplayValue] = useState(props.value);
    const [valueIsValid, setValueIsValid] = useState(true);

    let { isValid, cleanUp, isValidRegex, ...rest } = props;

    // Update the display value if it's updated elsewhere.
    useEffect(resetDisplayValueOnChange, [props.value])

    /**
     * Resets the display value of the component if the value
     * is changed somewhere else.
     */
    function resetDisplayValueOnChange () {
        let val = props.value;
        if (fullIsValid(val)) { val = internalCleanup(val) }
        setDisplayValue(val);
    }

    function wrappedOnChange (val) {
        props.onChange && props.onChange(val);
    }

    function internalCleanup (val) {
        if (cleanUp) {
            return cleanUp(val);
        } 
        return val;
    }

    /**
     * Returns true if all conditions for validity of this input are met.
     * If no validity methods have been passed to this object, returns true;
     */
    function fullIsValid (val) {

        // Default to true;
        let valid = true;

        if (isValid) {
            valid = valid && isValid(val);
        } 

        if (isValidRegex) {
            valid = valid && val.matches(isValidRegex);
        }

        return valid;
    }

    /**
     * Updates the displayed and internal value of the input. Will fire on change if all 
     * requirements for validity are satisfied, otherwise, does not.
     * @param {*} e 
     */
    function internalOnChange (e) {
        const val = e.target.value;
        
        let cleanVal = internalCleanup(val);

        if (fullIsValid(val)) {
            setValueIsValid(true);
            wrappedOnChange(cleanVal);
            setDisplayValue(cleanVal.toString());
        } else {
            setDisplayValue(cleanVal);
            setValueIsValid(false);
        }
    }

    /**
     * Runs when the text input is blurred, or after a specified amount of
     * time after an edit.
     * @param {*} e 
     */
    function internalOnChangeComplete (e) {
        internalOnChange(e);
        props.onChangeComplete && props.onChangeComplete(displayValue);
    }

    return (
        <input
            {...rest}
            className={classNames(props.className, {"invalid": !valueIsValid, "valid": valueIsValid})}
            value={displayValue}
            type="text"
            onChange={internalOnChange}
            onBlur={internalOnChangeComplete}/>
    )
}