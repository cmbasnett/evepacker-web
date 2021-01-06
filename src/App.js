import './App.css';
import React, { useState } from 'react';
import { Button, TextField, TextareaAutosize, makeStyles, Toolbar, Box, InputAdornment, Container, CircularProgress, Typography, Select, MenuItem, Checkbox, FormControlLabel, Icon, LinearProgress } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { DataGrid } from '@material-ui/data-grid';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import AppBar from '@material-ui/core/AppBar'
import { CallSplit } from '@material-ui/icons'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/teal';
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = createMuiTheme({
  spacing: 8,
  palette: {
    type: 'dark',
    primary: blue
  },
});

const API_HOST = 'http://localhost:5000'


function pack(blob, volume, should_allow_splitting) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'blob': blob,
      'volume': volume,
      'should_allow_splitting': should_allow_splitting
    })
  };
  return fetch(`${API_HOST}/api/pack`, options)
}

const useStyles = makeStyles({
  container: {
    maxHeight: 800
  }
})

function renderCellPrice(params) {
  return <Box>{parseFloat(params.value).toLocaleString('en-US')}</Box>
}

function renderCellVolume(params) {
  return parseFloat(params.value).toLocaleString('en-US')
}

function valueGetterVolume(params) {
  return parseFloat(params.value)
}

function valueGetterPrice(params) {
  return parseFloat(params.value)
}

function renderQuantityCell(params) {
  return <Box display='flex' alignItems='center'>{params.value} {params.row.is_split ? <CallSplit color='secondary' style={{ marginLeft: '0.5em', fontSize: 16 }} /> : null}</Box>
}

function renderNameCell(params) {
  return <Box display='flex' justifyItems='center'>
      <img src={`https://images.evetech.net/types/${params.row.typeid}/icon?size=32`} style={{paddingRight: '1em' }} />
      <CopyToClipboard text={params.value}>
        <span className='itemName'>{params.value}</span>
      </CopyToClipboard>
    </Box>
}

function ItemTable(props) {
  const columns = [
    { field: 'name', headerName: 'Name', width: 400, renderCell: renderNameCell },
    { field: 'quantity', headerName: 'Quantity', width: 150, renderCell: renderQuantityCell, valueGetter: valueGetterVolume },
    { field: 'volume', headerName: 'Volume (m3)', width: 150, renderCell: renderCellVolume, valueGetter: valueGetterVolume },
    { field: 'price', headerName: 'Est. Price (ISK)', width: 175, renderCell: renderCellPrice, valueGetter: valueGetterPrice }
  ]
  return <Paper style={props.style}>
    <div style={{ width: 900 }}>
      <DataGrid rows={props.items} columns={columns} density='compact' disableSelectionOnClick autoHeight pagination={null}  />
    </div>
  </Paper>
}

function SearchBox(props) {

  const [blob, setBlob] = useState('')
  const [volume, setVolume] = useState('')
  const [shouldAllowSplitting, setShouldAllowSplitting] = useState(true)

  function onVolumeChange(event) {
    setVolume(event.target.value)
  }

  function onBlobChange(event) {
    setBlob(event.target.value)
  }

  return (
    <Paper>
      <Box p={2} display='flex' flexDirection='column'>
        <TextField 
          InputProps={{
            endAdornment: <InputAdornment position="end">m³</InputAdornment>,
          }}
          placeholder='0'
          variant='outlined'
          id='volume'
          onChange={onVolumeChange}
          helperText='Volume'
        />
        <TextareaAutosize style={{minHeight: 64}} id='blob' rows={4} rowsMax={4} onChange={onBlobChange}placeholder='Paste (Ctrl+V) the contents from your inventory' />
        <FormControlLabel id='shouldAllowSplitting' control={<Checkbox checked={shouldAllowSplitting} color='primary' onChange={() => setShouldAllowSplitting(!shouldAllowSplitting)} />} label='Allow Stack Splitting' />
        <Box paddingTop={1} display='flex' justifyContent='center'>
          <Button color='primary' variant='contained' onClick={() => { props.onClickFunc(blob, volume, shouldAllowSplitting)}}>PACK IT</Button>
        </Box>
      </Box>
    </Paper>
  )
}

function App() {

  const [response, setResponse] = useState(null)

  function packIt(blob, volume, shouldAllowSplitting) {
    pack(blob, volume, shouldAllowSplitting).then(response => {
      response.json().then(json => {
        let id = 0
        json.items.forEach(element => {
          element.id = ++id
        });
        setResponse(json)
      })
    }, error => {
      alert(error)
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position='static'>
        <Toolbar variant='dense'>
          <img src={process.env.PUBLIC_URL + '/logo.png'} />
        </Toolbar>
      </AppBar>
      <Container fixed>
        <Box p={1} display='flex'> {/* top level container */}
          <Box>
            <SearchBox onClickFunc={packIt} />
          </Box>
            {response &&
              <Box marginLeft={1} flexDirection='row'>
                <Box p={1} >
                  <Typography variant={'h5'}>
                    Packed ISK: {parseFloat(response.total_price).toLocaleString('en-US')} ISK
                  </Typography>
                  <Typography variant={'h5'}>
                    Packed Volume: {parseFloat(response.total_volume).toLocaleString('en-US')} m³
                  </Typography>
                  <LinearProgress variant="determinate" value={50} />
                </Box>
                <ItemTable items={response.items} />
              </Box>
            }
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
