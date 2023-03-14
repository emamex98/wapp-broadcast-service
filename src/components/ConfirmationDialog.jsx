import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useState } from 'react';

function ConfirmationDialog(props) {

  let open = props.open;

  const handleConfirmation = () => {
    props.sendMessage();
    props.setOpenConfirmation(false);
  };

  const handleClose = () => {
    props.setOpenConfirmation(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Revisa antes de enviar...
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Estás a punto de enviar la plantilla <b>{props.data.template}</b> a {props.data.contactsLength} contactos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmation} variant="contained" color="success">Enviar</Button>
          <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ConfirmationDialog