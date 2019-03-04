import React, {Component} from 'react'

import TimedChangeInput from '../TimedChangeInput/TimedChangeInput';

var classNames = require('classnames'); 

/**
 * Creates a numeric timed input.
 */
class NumericTimedChangeInput extends Component {
    constructor(props) {
        super(props); 

        this.state = {
            validEntry: this.isValidFloat(this.sanitizeValue(this.props.value)),
        }
    }

    /**
     * Determines if a string contains a valid float.
     * @returns {boolean} True if string contains only characters in a float. False otherwise.
     */
    isValidFloat = (val) => {
        let str = val.toString(); 

        if (str.startsWith("-")) {
            str = str.replace("-", ""); // TODO: Update this to be a bit more robust for negative numbers.
        }

        // Ensure the string does not contain letters or invalid characters.
        let noAlphabeticChars = /^[0-9,.]*$/.test(str); 
        return noAlphabeticChars && !isNaN(parseFloat(str));
    }

    /**
     * Constrain a value between a max and min.
     * @returns {number} constrained value between props.min and props.max
     */
    constrain = (val) => {
        if (this.props.min !== undefined) {
            val = Math.max(this.props.min, val);
        }

        if (this.props.max !== undefined) {
            val = Math.min(this.props.max, val);
        }

        return val;
    }

    /**
     * Wraps the given on change function and properly sets the state if an invalid value 
     * is provided.
     */
    wrappedOnChange = (val) => {
        if (this.props.onChange && this.isValidFloat(val)) {
            let parsedVal = parseFloat(val); 
            
            parsedVal = this.constrain(parsedVal);
            this.props.onChange(parsedVal);
            this.setState({
                validEntry: true,
            }); 
        } else {
            this.setState({
                validEntry: false,
            }); 
        }
    }

    /**
     * sanitize away undefined and null values.
     */
    sanitizeValue = (val) => {
        return val === undefined ?  "undefined" : val;
    }

    render () {
        let cleanValue = this.sanitizeValue(this.props.value); 
        return (
            <TimedChangeInput 
                delay={150}
                {...this.props}
                className={classNames({"wick-input-invalid": (!this.state.validEntry)}, this.props.className)}
                value={cleanValue.toLocaleString()}
                onChange={this.wrappedOnChange}
            />
        ); 
    }
}

export default NumericTimedChangeInput;