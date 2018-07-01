export default {
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
