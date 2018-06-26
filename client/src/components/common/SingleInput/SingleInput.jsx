import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import "./SingleInput.css";

export default class SingleInput extends PureComponent {
  static propTypes = {
    type: PropTypes.oneOf(["text", "number"]).isRequired,
    buttonText: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: "",
    };
  }

  onChange = ({ target: { value } }) => {
    this.setState({ value });
  };

  onSubmit = (event) => {
    event.preventDefault();

    let value;
    switch (this.props.type) {
      case "text":
        value = this.state.value;
        break;

      case "number":
        value = Number.parseFloat(this.state.value);
        break;

      default:
        value = null;
        break;
    }

    this.props.onSubmit(value);
  };

  render() {
    const { type, buttonText, onSubmit, value, ...passthroughProps } = this.props;

    return (
      <div className="component-SingleInput">
        <form onSubmit={this.onSubmit} noValidate>
          <input {...passthroughProps} type={type} onChange={this.onChange} />
          <button type="submit">{buttonText}</button>
        </form>
      </div>
    );
  }
}