import React, {Component} from 'react'

var classNames = require('classnames'); 

/**
 * This is an input which will fire its onChange event after a specific delay has passed since 
 * the last change, when the input is blurred, or when the enter key is pressed while the input 
 * is focused.
 * 
 * props
 * 
 * delay {number} milliseconds to wait before attempting update. Default: 500
 * 
 * onChange {function} function to call when delay has passed.
 * 
 * stallCharacters {string[]} if the input only contains a character in this array, onChange will not be fired.
 */
class TimedChangeInput extends Component {
    constructor (props) {
        super(props);

        let cleanValue = this.props.value ? this.props.value : ""; 
        this.state = {
            value: cleanValue,
            lastUpdatedValue: cleanValue,
            lastChange: 0,
            updating: false,
        }

        this.delay = this.props.delay ? this.props.delay : 500; // milliseconds
    }

    componentWillUnmount = () => {
        this.wrappedOnChange(); 
    }

    valueValid = () => {
        let stalled = false;
        let period = false;

        // Stall if the only character in the input is a stall character.
        if (this.props.stall !== undefined) {
            stalled = this.props.stall.includes(this.state.value)
        }

        // If we're trying to add floats, ensure we can add periods.
        if (this.state.value.length > 0) {
            let char = this.state.value.charAt(this.state.value.length - 1);
            if (char === '.') {
                period = true;
            }
        }

        return (this.state.value !== "") && !stalled && !period;
    }

    /**
     * Wrapped onChange prop which is passed the clean value. Only fires if the value
     * has changed since the last update.
     */
    wrappedOnChange = () => {
        if (this.props.onChange && 
            (this.state.value !== this.state.lastUpdatedValue) &&
            (this.valueValid())) {
            this.props.onChange(this.state.value); 

            this.setState({
                lastUpdatedValue: this.state.value, 
            });
        }
    }

    /**
     * Called when the delay has passed. 
     */
    onTimeComplete = () => {
        let date = new Date(); 
        let currentTime = date.getTime(); 
        let timePassed = currentTime - this.state.lastChange; 
        if (timePassed >= this.delay) {
            this.wrappedOnChange(); 
        }
    }

    /**
     * Called on every change. 
     */
    internalOnChange = (e) => {
        let date = new Date(); 
        this.setState({
            value: e.target.value,
            lastChange: date.getTime(), 
        },
        () => (setTimeout(this.onTimeComplete, this.delay))
        ); 
    }

    /**
     * Called on every key press while input is focused.
     */
    handleKeyDown = (e) => {
        // Check when enter is pressed. 
        if (e.charCode === 13) {
            this.wrappedOnChange(); 
        }
    }

    static getDerivedStateFromProps(props, state) {
        /**
         * Force update the state if we've been provided a new value prop.
         */
        if (state.value !== props.value && state.lastUpdatedValue !== props.value) {
            return {
                value: props.value,
                lastUpdatedValue: props.value, 
                lastChange: new Date().getTime(), 
            }
        } 
        return {}
    }

    render() {
        // Never display -0 to the user.
        let val = this.state.value;
        if (this.state.value === "-0") {
            val = "0";
        }
        
        return (
            <input
                className={classNames(this.props.className)}
                {...this.props}
                value={val}
                type="text"
                onChange={this.internalOnChange}
                onBlur={this.wrappedOnChange}
                onKeyPress={this.handleKeyDown}
          />
        )
    }
}
    
export default TimedChangeInput