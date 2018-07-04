export default {
  /* duration in milliseconds */
  delay: (duration) => {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  },

  getEnvironmentVariables: (variableNames) => {
    const variables = {};
    variableNames.forEach((variableName) => {
      variables[variableName] = process.env[`REACT_APP_${variableName}`];
    });
    return variables;
  },

  composeClassName: (...args) => {
    let composedClassName = "";

    const addClassName = (className) => {
      if (composedClassName !== "") composedClassName += " ";
      composedClassName += className;
    };

    args.forEach((arg) => {
      // eslint-disable-next-line default-case
      switch (typeof arg) {
        case "string":
          addClassName(arg);
          break;

        case "object":
          if (Array.isArray(arg)) {
            arg.forEach(addClassName);
          } else {
            Object.keys(arg).forEach((className) => {
              if (arg[className]) addClassName(className);
            });
          }
          break;
      }
    });

    return composedClassName;
  },
};
