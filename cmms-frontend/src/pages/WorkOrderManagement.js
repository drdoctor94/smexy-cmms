import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Toolbar,
  IconButton,
  Tooltip,
  Box,
  Fab,
  Switch,
  FormControlLabel
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from '../api/axiosConfig';
import WorkOrderFormModal from './WorkOrderFormModal';
import EditWorkOrderModal from './EditWorkOrderModal';

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const WorkOrderManagement = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('taskType');
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(true); // Work Order Table is set to dense by default
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      const { role } = response.data.user;

      if (role === 'Admin' || role === 'Technician' || role === 'Tenant') {
        setCurrentUserRole(role);
        fetchWorkOrders(); // Fetch work orders if the user is authorized
      } else {
        setError('You do not have access to view this page.');
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setError('Failed to fetch current user.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkOrders = () => {
    axios
      .get('/api/work-orders')
      .then((response) => setWorkOrders(response.data))
      .catch((error) => console.error(error));
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenEditModal = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedWorkOrder(null);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortComparator = (a, b) => {
    if (!a[orderBy] || !b[orderBy]) return 0;

    if (typeof a[orderBy] === 'number' && typeof b[orderBy] === 'number') {
      return order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    } else if (typeof a[orderBy] === 'string' && typeof b[orderBy] === 'string') {
      return order === 'asc' ? a[orderBy].localeCompare(b[orderBy]) : b[orderBy].localeCompare(a[orderBy]);
    }

    return 0;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = workOrders.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleCheckboxClick = (event, _id) => {
    const selectedIndex = selected.indexOf(_id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, _id);
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

  const isSelected = (_id) => selected.indexOf(_id) !== -1;

  const handleDeleteSelected = () => {
    if (selected.length === 0) {
      console.error('No work orders selected for deletion');
      return;
    }

    const promises = selected.map((_id) =>
      axios.delete(`/api/work-orders/${_id}`)
        .then(() => {
          console.log(`Deleted work order with _id: ${_id}`);
        })
        .catch(error => {
          console.error(`Failed to delete work order with _id: ${_id}`, error.response ? error.response.data : error.message);
        })
    );

    Promise.all(promises)
      .then(() => {
        fetchWorkOrders();
        setSelected([]);
      })
      .catch((error) => console.error('Failed to complete deletion of work orders', error));
  };

  const paginatedWorkOrders = workOrders
    .sort(sortComparator)
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar
          sx={[
            { pl: { sm: 2 }, pr: { xs: 1, sm: 1 } },
            selected.length > 0 && {
              bgcolor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            },
          ]}
        >
          {selected.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selected.length} selected
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              Work Orders
            </Typography>
          )}

<Fab
  color="primary"
  aria-label="add"
  onClick={handleOpenModal}
  sx={{
    ml: 2,
    width: 45, // Ensures width is the same as height
    height: 45, // Same height to maintain the circular shape
    borderRadius: '50%', // Ensures it's a perfect circle
    minWidth: '45px', // Prevents shrinking below this size
    minHeight: '45px', // Prevents shrinking below this size
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <AddIcon />
</Fab>

          
          {selected.length > 0 && (
            <Tooltip title="Delete">
              <IconButton onClick={handleDeleteSelected}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>

        {/* Sticky header with scrollable container */}
        <TableContainer sx={{ maxHeight: '70vh' }}> {/* Set maxHeight to 70vh for dynamic height */}
          <Table size={dense ? 'small' : 'medium'} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: '50px' }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < workOrders.length}
                    checked={workOrders.length > 0 && selected.length === workOrders.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell sx={{ width: '120px' }}>
                  <TableSortLabel
                    active={orderBy === 'workOrderId'}
                    direction={order}
                    onClick={() => handleRequestSort('workOrderId')}
                  >
                    Task ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '150px' }}>
                  <TableSortLabel
                    active={orderBy === 'taskType'}
                    direction={order}
                    onClick={() => handleRequestSort('taskType')}
                  >
                    Task Type
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '250px' }}>Description</TableCell>
                <TableCell sx={{ width: '100px' }}>
                  <TableSortLabel
                    active={orderBy === 'roomNumber'}
                    direction={order}
                    onClick={() => handleRequestSort('roomNumber')}
                  >
                    Room Number
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '100px' }}>Status</TableCell>
                <TableCell sx={{ width: '100px' }}>Priority</TableCell>
                <TableCell sx={{ width: '150px' }}>Assigned To</TableCell>
                <TableCell sx={{ width: '150px' }}>
                  <TableSortLabel
                    active={orderBy === 'createdDate'}
                    direction={order}
                    onClick={() => handleRequestSort('createdDate')}
                  >
                    Created Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '80px' }}>Age (Days)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedWorkOrders.map((order) => {
                const isItemSelected = isSelected(order._id);
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={order._id}
                    selected={isItemSelected}
                    onDoubleClick={() => handleOpenEditModal(order)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={(event) => handleCheckboxClick(event, order._id)}
                      />
                    </TableCell>
                    <TableCell>{order.workOrderId}</TableCell>
                    <TableCell>{order.taskType}</TableCell>
                    <TableCell>{order.details}</TableCell>
                    <TableCell>{order.roomNumber}</TableCell>
                    <TableCell>{capitalizeFirstLetter(order.status)}</TableCell>
                    <TableCell>{order.priority}</TableCell>
                    <TableCell>{order.assignedTo ? order.assignedTo.name : 'Unassigned'}</TableCell>
                    <TableCell>{new Date(order.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell>{order.age}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={workOrders.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>

      <FormControlLabel
        control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} />}
        label="Dense padding"
      />

      <WorkOrderFormModal 
        open={openModal} 
        handleClose={handleCloseModal} 
        onWorkOrderSubmit={fetchWorkOrders}
      />

      <EditWorkOrderModal
        open={editModalOpen}
        handleClose={handleCloseEditModal}
        workOrder={selectedWorkOrder}
        fetchWorkOrders={fetchWorkOrders}
      />
    </Box>
  );
};

export default WorkOrderManagement;
