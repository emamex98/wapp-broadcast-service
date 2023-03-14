const generatePromise = (number, token, templateName, args) => {
  const body = {
    messaging_product: 'whatsapp',
    to: number,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'es',
      },
      components: args,
    },
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  };

  return fetch(
    'https://graph.facebook.com/v15.0/107979732160205/messages',
    options
  );
};

export const sendTemplateRemiders = (contacts, callParams, setOutput) => {
  let { token, templateName, args, firstArgIsName } = callParams;

  const numbers = contacts.map((row) => row[1]);

  let errorCount = 0;
  let output = '';

  const result = numbers.reduce((acc, number, i) => {
    let statusCode;


    const resp = acc
      .then(() => {
        if (firstArgIsName) {
          args[0].parameters[0].text = contacts[i][0];
        }
        return generatePromise(number, token, templateName, args);
      })
      .then((response) => {
        statusCode = response.status;
        return response.json();
      })
      .then((response) => {
        if (statusCode === 200) {
          output += `✅ Mensaje enviado a ${contacts[i][0]}, ${contacts[i][1]}\n`;
          setOutput(output);
        } else {
          output += `❌ Error al enviar a ${contacts[i][0]}, ${contacts[i][1]}\n   ${response.error.message}\n387470`;
          setOutput(output);
          errorCount += 1;
        }
      })
      .catch((err) => {
        output = `${err}\n`
        setOutput(output);
      });
    
    return resp;

  }, Promise.resolve());

  result.then(() => {
    output += `\n🟪 Mensaje enviado a ${numbers.length - errorCount} de ${numbers.length} contactos.`
    setOutput(output);
  });
};
