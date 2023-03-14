import { useState, useEffect } from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';

import { sendTemplateRemiders } from '../services/sendMessage';
import ArgumentFormBuilder from './ArgumentFormBuilter';
import ConfirmationDialog from './ConfirmationDialog';

import * as templates from '../models/message_templates';

const theme = createTheme();

const parseContacts = (contacts) => {
  if (!contacts) {
    return;
  }

  const contactsArr = [];
  const phoneNumbers = [];

  try {

    const lines = contacts.split('\n');
    const csvRegex = new RegExp('[A-Z,a-z, ,á,é,í,ó,ú,ñ]*,[ ]*[0-9]*');

    if (lines.length && csvRegex.test(lines[0])) {
      lines.forEach((line) => {
        const fields = line.split(',');
        if (phoneNumbers.includes(fields[1].trim())) {
          return;
        }
        contactsArr.push([
          fields[0].trim(),
          fields[1].trim()
        ]);
        phoneNumbers.push(
          fields[1].trim()
        )
      });
      return contactsArr;
    }

    contacts = JSON.parse(contacts);
    
    if (!Array.isArray(contacts)) {
      const keys = Object.keys(contacts);
      keys.forEach((key) => {
        if (phoneNumbers.includes(contacts[key].phone.trim())) {
          return;
        }
        contactsArr.push([
          contacts[key].name.trim(),
          contacts[key].phone.trim()
        ]);
        phoneNumbers.push(contacts[key].phone.trim());
      });
    } else if (Array.isArray(contacts)) {
      contacts.forEach((contact) => {
        if (phoneNumbers.includes(contacts[key].phone.trim())) {
          return;
        }
        contactsArr.push([
          contact.name.trim(),
          contact.phone.trim()
        ]);
        phoneNumbers.push(contacts[key].phone.trim());
      });
    }

    return contactsArr;

  } catch (e) {
    console.log(e);
    throw e;
  }
}

const contactToString = (contacts) => {
  if (!contacts) {
    return '';
  }

  let string = '';
  let count = 1;
  contacts.forEach((contact) => {
    string += `${count}. ${contact[0]} - ${contact[1]}\n`
    count++;
  });
  return string;
}

const handleFileUpload = (file, setRawContacts) => {
  const reader = new FileReader();
  reader.onload = () => {
    setRawContacts(reader.result);
  }
  reader.readAsText(file.target.files[0]);
}

function FormComponent() {
  const [rawContacts, setRawContacts] = useState('');
  const [contacts, setContacts] = useState('');
  const [templateList, setTemplateList] = useState([]);
  const [template, setTemplate] = useState('');
  const [args, setArgs] = useState({});
  const [params, setParams] = useState({ firstArgIsName: true });

  const [openConfirmation, setOpenConfirmation] = useState(false);

  const [output, setOutput] = useState('');

  useEffect(() => {
    const localTemplateList = [];
    Object.keys(templates).forEach((item) => {
      localTemplateList.push(
        <MenuItem value={item} key={item}>{item}</MenuItem>
      )
    });
    setTemplateList(localTemplateList);
  }, [])

  const sendMessage = () => {
    setOutput('');
    sendTemplateRemiders(
      contacts, 
      {
        token: params.token,
        templateName: template,
        args,
        firstArgIsName: params.firstArgIsName
      },
      setOutput
    );
  }

  return (

    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='sm'>
        <Box 
          className='formBox'
          sx={{
            marginTop: 6
          }}
        >
          <CssBaseline />
          <div>

            <form>
              <TextField 
                name="contacts" 
                id="contacts" 
                label="Ingresar Contactos"
                cols={30} rows={10} 
                variant="outlined"
                multiline
                fullWidth
                value={rawContacts}
                onChange={(e) => (setRawContacts(e.target.value))}
              />

              <br/>
              <br/>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button 
                    variant="outlined" 
                    component="label"
                    fullWidth
                  >
                    Cargar CSV / JSON
                    <input 
                      hidden 
                      accept=".csv,.json" 
                      type="file"
                      onChange={(e) => { handleFileUpload(e, setRawContacts)}}
                    />
                  </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button 
                      variant="contained"
                      fullWidth
                      onClick={(e) => { 
                        e.preventDefault()
                        setContacts(
                          parseContacts(rawContacts)
                        );
                      }}
                    >
                      Validar Contactos
                    </Button>
                </Grid>
              </Grid>

            </form>

            <br/>
            <br/>

            <form>
              <TextField 
                name="parsed_contacts" 
                id="parsed_contacts"
                label="Contactos Validados"
                cols={30} rows={10} 
                multiline
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                value={contactToString(contacts)}
              />

              <br/>
              <br/>

              <TextField 
                name="token" 
                id="token"
                label="Token"
                type="password"
                fullWidth
                onChange={(e) => setParams({...params, token: e.target.value})}
              />

              <br/>
              <br/>

              <FormControl fullWidth>
                <InputLabel id="template_name_label">Plantilla</InputLabel>
                <Select
                  labelId="template_name_label"
                  name="template_name" 
                  id="template_name"
                  label="Plantilla"
                  value={template}
                  fullWidth
                  onChange={(e) => {
                    setTemplate(e.target.value)
                  }}
                >
                  {templateList}
                </Select>
              </FormControl>

              <br/>
              <br/>

              <ArgumentFormBuilder templateName={template} args={[args, setArgs]} />
              
              <FormControlLabel 
                control={
                  <Checkbox 
                    defaultChecked 
                    name="first_arg_dynamic" 
                    id="first_arg_dynamic"
                    onChange={(e) => {
                      setParams({...params, firstArgIsName: e.target.checked})
                    }}
                  />
                } 
                label="El primer campo es dinámico" 
              />

              <br/>
              <br/>

              <Button 
                variant="contained"
                fullWidth
                onClick={(e) => { 
                  e.preventDefault();
                  setOpenConfirmation(true);
                }}
              >
                Enviar mensajes
              </Button>

              <br/>
              <br/>

              <TextField 
                name="output" 
                id="output"
                label="Resultados"
                cols={30} rows={10} 
                multiline
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                value={output}
              />

              <br/>
              <br/>

              <ConfirmationDialog 
                open={openConfirmation} 
                setOpenConfirmation={setOpenConfirmation}
                data={{
                  template: template,
                  contactsLength: contacts.length
                }}
                sendMessage={sendMessage}
              />

            </form>
          </div>
        </Box>

    

      </Container>

      

    </ThemeProvider>

    
  )
}

export default FormComponent;
