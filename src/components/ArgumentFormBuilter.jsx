import { useState, useEffect, Fragment } from 'react';
import * as templates from '../models/message_templates';
import TextField from '@mui/material/TextField';

let localArgsState;

const generatePayload = (type, value, index) => {
  if (type === 'text') {
    return {
      type,
      text: value
    }
  } else if (type === 'button') {
    return {
      type,
      sub_type: 'url',
      index,
      parameters: [
        {
          type: 'text',
          text: value,
        }
      ]
    }
  }
}

function ArgumentFormBuilder(props) {

  const template = templates[props.templateName];
  const [args, setArgs] = props.args;

  useEffect(() => {
    if (!template) {
      setArgs([]);
      return;
    }

    const localArgs = [{
      type: 'body',
      parameters: []
    }];

    template.forEach((field) => {
      if (field.type === 'text') {
        localArgs[0].parameters.push(
          generatePayload(field.type, field.defaultValue || '')
        );
      } else if (field.type === 'button') {
        localArgs.push(
          generatePayload(field.type, field.defaultValue || '', field.index || 0)
        );
      }
    });

    setArgs(localArgs);
    localArgsState = localArgs;

  }, [props.templateName]);

  const generateForm = () => {
    if (!template) {
      return (
        <p></p>
      );
    }

    const formFields = [];

    template.forEach((field) => {
      formFields.push(
        <Fragment key={field.fieldName}>
          <TextField
            name={field.fieldName}
            label={field.fieldLabel}
            defaultValue={field.defaultValue}
            fullWidth
            onChange={(e) => {
              const localArgs = localArgsState;
              if (field.type === 'text') {
                localArgs[0].parameters[field.index].text = e.target.value;
              } else if (field.type === 'button') {
                localArgs[1].parameters[field.index].text = e.target.value;
              }
              setArgs(localArgs);
            }}
          />
          <br/>
          <br/>
        </Fragment>
      )
    })

    return formFields;
  }

  return generateForm();
}

export default ArgumentFormBuilder;