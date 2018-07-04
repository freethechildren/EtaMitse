import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Button, Input } from "@material-ui/core";

import "./SingleInputForm.css";

export default class SingleInputForm extends PureComponent {
  static propTypes = {
    type: PropTypes.oneOf(["text", "number"]).isRequired,
    buttonText: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    error: PropTypes.bool,
    buttonVariant: PropTypes.string,
  };

  static defaultProps = {
    error: false,
    buttonVariant: "raised",
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
    const { type, buttonText, onSubmit, value, error, buttonVariant, ...passthroughProps } = this.props;

    return (
      <div className="component-SingleInputForm">
        <form onSubmit={this.onSubmit} noValidate>
          <Input {...passthroughProps} type={type} onChange={this.onChange} error={error} />
          <Button type="submit" variant={buttonVariant} color="primary">{buttonText}</Button>
        </form>
      </div>
    );
  }
}