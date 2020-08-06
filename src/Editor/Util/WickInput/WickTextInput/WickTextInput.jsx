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

    // Update the display value if it's updated elsewhere.
    useEffect(() => {
        let val = props.value;
        if (fullIsValid(val)) { val = cleanUp(val) }

        setDisplayValue(val);
    }, [props.value])

    function wrappedOnChange (val) {
        props.onChange && props.onChange(val);
    }

    function cleanUp (val) {
        if (props.cleanUp) {
            return props.cleanUp(val);
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

        if (props.isValid) {
            valid = valid && props.isValid(val);
        } 

        if (props.isValidRegex) {
            valid = valid && val.matches(props.isValidRegex);
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
        

        if (fullIsValid(val)) {
            const cleanVal = cleanUp(val);
            setValueIsValid(true);
            wrappedOnChange(cleanVal);
            setDisplayValue(cleanVal);
        } else {
            setDisplayValue(val);
            setValueIsValid(false);
        }
    }

    return (
        <input
            {...props}
            className={classNames(props.className, {"invalid": !valueIsValid, "valid": valueIsValid})}
            value={displayValue}
            type="text"
            onChange={internalOnChange}
            onBlur={internalOnChange}/>
    )
}