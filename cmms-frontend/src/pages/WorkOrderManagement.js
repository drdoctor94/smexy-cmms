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
  FormControlLabel,
  TextField,
  Button,
  Collapse,
  MenuItem,
  Select,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import axios from '../api/axiosConfig';
import WorkOrderFormModal from './WorkOrderFormModal';
import EditWorkOrderModal from './EditWorkOrderModal';

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Status, task types, and priorities from your existing values
const taskTypes = [
  'Clean Up / Spill',
  'Cooling Issue',
  'Electrical Issue',
  'Equipment Repairs',
  'Fire Safety',
  'General Maintenance Request',
  'Health and Safety',
  'Heating Issues',
  'Lighting Issues',
  'Mechanical Issues',
  'Painting / Touch Ups',
  'Pest Control',
  'Plumbing Issues',
  'Waste Issues',
];

const priorities = ['Low', 'Medium', 'High', 'Emergency'];

const statusOptions = ['New', 'Pending', 'Delayed', 'Closed', 'Excluded', 'Re-Opened'];

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
  const [dense, setDense] = useState(true);
  const [filterExpanded, setFilterExpanded] = useState(false); // Toggle for filter visibility

  // State for filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [keyword, setKeyword] = useState(''); // Add state for keyword search

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      const { role } = response.data.user;

      if (role === 'Admin' || role === 'Technician' || role === 'Tenant') {
        fetchWorkOrders();
      } else {
        console.error('You do not have access to view this page.');
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchWorkOrders = () => {
    axios
      .get('/api/work-orders')
      .then((response) => setWorkOrders(response.data))
      .catch((error) => console.error(error));
  };

  // Filter function
  const applyFilters = () => {
    let filteredWorkOrders = [...workOrders];

    // Filter by date range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      filteredWorkOrders = filteredWorkOrders.filter((order) => {
        const orderDate = new Date(order.createdDate);
        return orderDate >= from && orderDate <= to;
      });
    }

    // Filter by status (case insensitive)
    if (selectedStatus) {
      filteredWorkOrders = filteredWorkOrders.filter((order) => {
        return (
          order.status &&
          order.status.toLowerCase().trim() === selectedStatus.toLowerCase().trim()
        );
      });
    }

    // Filter by task type (case insensitive)
    if (selectedTaskType) {
      filteredWorkOrders = filteredWorkOrders.filter((order) => {
        return (
          order.taskType &&
          order.taskType.toLowerCase().trim() === selectedTaskType.toLowerCase().trim()
        );
      });
    }

    // Filter by priority (case insensitive)
    if (selectedPriority) {
      filteredWorkOrders = filteredWorkOrders.filter((order) => {
        return (
          order.priority &&
          order.priority.toLowerCase().trim() === selectedPriority.toLowerCase().trim()
        );
      });
    }

    // Filter by keyword in description and notes (case insensitive)
    if (keyword) {
      const keywordLower = keyword.toLowerCase().trim();
      filteredWorkOrders = filteredWorkOrders.filter((order) => {
        const descriptionMatch = order.details?.toLowerCase().includes(keywordLower);
        const notesMatch = order.notes?.some(note => note.toLowerCase().includes(keywordLower));
        return descriptionMatch || notesMatch;
      });
    }

    return filteredWorkOrders;
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenEditModal = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => setEditModalOpen(false);

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
      const newSelecteds = paginatedWorkOrders.map((n) => n._id); // Select only the filtered, visible work orders
      setSelected(newSelecteds);
      return; // Exit early since we already handled the selection
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
      axios
        .delete(`/api/work-orders/${_id}`)
        .then(() => {
          console.log(`Deleted work order with _id: ${_id}`);
        })
        .catch((error) => {
          console.error(
            `Failed to delete work order with _id: ${_id}`,
            error.response ? error.response.data : error.message
          );
        })
    );

    Promise.all(promises)
      .then(() => {
        fetchWorkOrders();
        setSelected([]);
      })
      .catch((error) => console.error('Failed to complete deletion of work orders', error));
  };

  const filteredWorkOrders = applyFilters();
  const paginatedWorkOrders = filteredWorkOrders
    .sort(sortComparator)
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              width: 45,
              height: 45,
              borderRadius: '50%',
              minWidth: '45px',
              minHeight: '45px',
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

          {/* Filter Toggle Button */}
          <IconButton onClick={() => setFilterExpanded(!filterExpanded)}>
            <ManageSearchIcon />
          </IconButton>
        </Toolbar>

        {/* Collapsible Filters */}
        <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
            <TextField
              label="From Date (MM-DD-YYYY)"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                applyFilters(); // Apply filters when the value changes
              }}
              fullWidth
            />
            <TextField
              label="To Date (MM-DD-YYYY)"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                applyFilters(); // Apply filters when the value changes
              }}
              fullWidth
            />
            <TextField
              label="Status"
              select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                applyFilters(); // Apply filters when the value changes
              }}
              fullWidth
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Task Type"
              select
              value={selectedTaskType}
              onChange={(e) => {
                setSelectedTaskType(e.target.value);
                applyFilters(); // Apply filters when the value changes
              }}
              fullWidth
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {taskTypes.map((task) => (
                <MenuItem key={task} value={task}>
                  {task}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Priority"
              select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                applyFilters(); // Apply filters when the value changes
              }}
              fullWidth
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {priorities.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Keyword Search"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                applyFilters(); // Apply filters when the value changes
              }}
              fullWidth
            />
          </Box>
        </Collapse>

        {/* Table */}
        <TableContainer>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: '50px' }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < paginatedWorkOrders.length}
                    checked={paginatedWorkOrders.length > 0 && selected.length === paginatedWorkOrders.length}
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
                    <TableCell>
                      {order.assignedTo ? order.assignedTo.name : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.age}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredWorkOrders.length}
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
