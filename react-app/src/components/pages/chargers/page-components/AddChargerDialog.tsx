import { chargerCollection } from '@/remote-access';
import { ChargerStation } from '@/remote-access/types';
import { Button, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText, Input, InputLabel, LinearProgress, Theme } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useTheme } from '@material-ui/styles';
import React, { FC, useState } from 'react';

interface AddChargerDialogProps {
  open: boolean
  handleClose: () => void
  station: ChargerStation
}

interface AddChargerDialogState {
  loading: boolean
  serialNumber?: string
  successfulAddedSerialNumber?: string
  errorState: {
    alert?: string
    serialNumber?: string
  }
}

const AddChargerDialog: FC<AddChargerDialogProps> = ({ open, handleClose, station }: any) => {
  const theme: Theme = useTheme();
  const [state, setState] = useState<AddChargerDialogState>({
    loading: false,
    errorState: {}
  });

  const handleSerialNumberChange = (newSerialNumber: string) => {
    setState({
      ...state,
      serialNumber: newSerialNumber
    });
  };

  const handleAddClick = () => {
    if (state.serialNumber !== undefined) {
      setState({
        ...state,
        loading: true
      });

      chargerCollection.addCharger({
        serialNumber: state.serialNumber,
        location: station.location,
        chargePointID: station.chargePointID
      }).then((result) => {
        if (result[1] !== null) {
          setState({
            ...state,
            errorState: {
              ...result[1],
              alert: result[1].error
            },
            loading: false
          });
        } else if (result[0]) {
          setState({
            ...state,
            errorState: {},
            successfulAddedSerialNumber: state.serialNumber,
            loading: false
          });
        }
      });
    } else {
      setState({
        ...state,
        errorState: {
          serialNumber: 'Required'
        }
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => { setState({ loading: false, errorState: {} }); handleClose(); }}
      fullWidth
    >
      {state.loading &&
        <LinearProgress />
      }
      <Collapse in={state.successfulAddedSerialNumber !== undefined}>
        <Alert>
          Chager: {state.successfulAddedSerialNumber} Added
        </Alert>
      </Collapse>
      <DialogTitle>Add Charger to Station</DialogTitle>
      {state.errorState.alert &&
        <Alert style={{ width: '100%' }} severity="warning">{state.errorState.alert}</Alert>
      }
      <DialogContent>
        <DialogContentText>
          ({station.chargePointID}), {station.name}
          <br />
          lon: {station.location[0]}
          <br />
          lat: {station.location[1]}
        </DialogContentText>
        <form>
          <FormControl fullWidth variant="outlined" error={state.errorState.serialNumber !== undefined}>
            <InputLabel htmlFor="charger-serial-number">Serial Number</InputLabel>
            <Input
              id="charger-serial-number"
              aria-describedby="charger-serial-number-helper"
              value={state.serialNumber}
              onChange={(e) => handleSerialNumberChange(e.target.value)}
            />
            <FormHelperText id="charger-serial-number-helper">
              {state.errorState.serialNumber
                ? `${state.errorState.serialNumber}`
                : 'Serial Number displayed on the Charger'
              }
            </FormHelperText>
          </FormControl>
        </form>

      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="primary"
          onClick={() => { setState({ loading: false, errorState: {} }); handleClose(); }}
        >Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          style={{
            backgroundColor: theme.flexiCharge.accent.primary,
            color: theme.flexiCharge.primary.white
          }}
          onClick={() => handleAddClick()}
        >Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddChargerDialog;