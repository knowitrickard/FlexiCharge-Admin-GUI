/* eslint-disable @typescript-eslint/prefer-optional-chain */
import { Theme, useTheme, useMediaQuery, TableProps, TableContainer, LinearProgress, Table, TableHead, TableRow, TableCell, Checkbox, TableBody, TablePagination } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { ChargerStation } from '@/remote-access/types';
import ChargerStationTableRow from './ChargerStationTableRow';

interface HeadCell {
  id: string
  label: string
  alignRight: boolean
}

const headCells: HeadCell[] = [
  {
    id: 'name',
    label: 'Station Name',
    alignRight: false
  },
  {
    id: 'price',
    label: 'Price',
    alignRight: false
  },
  {
    id: 'actions',
    label: 'Actions',
    alignRight: true
  }
];

interface ChargerStationTableHeadProps {
  numSelected: number
  rowCount: number
  handleSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const ChargerStationTableHead = (props: ChargerStationTableHeadProps) => {
  const { rowCount, numSelected, handleSelectAllClick } = props;
  return (
    <>
      <TableHead>
        <TableRow key="header">
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={handleSelectAllClick}
              inputProps={{
                'aria-label': 'select all stations'
              }}
            />
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.alignRight ? 'right' : 'left' }
            >
              {headCell.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    </>
  );
};

interface StationTableState {
  loaded?: boolean
  stations?: ChargerStation[]
  error?: boolean
  errorMessage?: string
}

const ChargerStationsTable = (props: any) => {
  const theme: Theme = useTheme();
  /* const [state, setState] = useState<StationTableState>({
    loaded: props.loaded,
    stations: props.stations
  }); */
  const state: StationTableState = {
    loaded: props.loaded,
    stations: props.stations
  };
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* const loadStations = () => {
    chargerStationCollection.getAllChargerStations().then((stations) => {
      setState({
        loaded: true,
        stations
      });
    }).catch((_) => {
      setState({
        loaded: true,
        error: true,
        errorMessage: 'Failed to load'
      });
    });
  };

  useEffect(() => {
    loadStations();
  }, []); */

  useEffect(() => {
    props.setSelectedStations(selected);
  }, [selected]);

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));
  const tableProps: TableProps = {
    size: isSmallScreen ? 'small' : 'medium'
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = state.stations?.map((station) => station.chargePointID);
      if (newSelecteds === undefined) return;
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelect = (stationId: number) => {
    const selectedIndex = selected.indexOf(stationId);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, stationId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (stationId: number) => selected.includes(stationId);

  return (
    <>
      <TableContainer
        style={{
          maxHeight: '600px',
          marginTop: theme.spacing(1)
        }}
      >
        {!state.loaded &&
          <LinearProgress />
        }
        <Table {...tableProps} stickyHeader aria-label="sticky table">
          <ChargerStationTableHead
            numSelected={selected.length}
            rowCount={state.stations ? state.stations.length : 6}
            handleSelectAllClick={handleSelectAllClick}
          />
          <TableBody>
            {state.stations?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((station, index) => {
                const isItemSelected = isSelected(station.chargePointID);
                return (
                  <ChargerStationTableRow
                    key={station.chargePointID}
                    station={station}
                    handleSelect={handleSelect}
                    selected={isItemSelected}
                    {...props}
                  >
                  </ChargerStationTableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </TableContainer>
      {state.stations &&
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={state.stations ? state.stations.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      }
    </>
  );
};

export default ChargerStationsTable;