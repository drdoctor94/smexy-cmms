import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 240;

// Main Content Styled Component
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
    }),
    ...(!open && {
      marginLeft: 0,
      width: '100%',
    }),
    // Ensure content is full width on mobile when sidebar floats
    '@media (max-width: 600px)': {
      marginLeft: 0,
      width: '100%',
    },
  })
);

// AppBar Styled Component
const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
  ...(!open && {
    marginLeft: 0,
    width: '100%',
  }),
  // Ensure AppBar stays full width on mobile
  '@media (max-width: 600px)': {
    width: '100%',
    marginLeft: 0,
  },
}));

// Drawer Styled Component
const DrawerStyled = styled(Drawer)(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : 0, // Set the width to 0 when closed
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: drawerWidth,
      overflowX: 'hidden',
    }),
    ...(!open && {
      overflowX: 'hidden',
    }),
  },
  // Float the sidebar over content on mobile
  '@media (max-width: 600px)': {
    position: 'absolute',
    zIndex: theme.zIndex.drawer + 2, // Ensure it's on top of everything
  },
}));

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)'); // Detect mobile screens
  const [open, setOpen] = React.useState(!isMobile); // Default to open unless on mobile

  const { logout } = useContext(AuthContext); // Use AuthContext to get logout function

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Close the sidebar when an item is selected on mobile
  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Work Orders', icon: <AssignmentIcon />, path: '/work-orders' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SASD Redding Partners, LLC.
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBarStyled>
      <DrawerStyled variant={isMobile ? 'temporary' : 'persistent'} open={open} onClose={handleDrawerClose}>
        <Toolbar>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              onClick={handleMenuItemClick} // Close the sidebar on click for mobile
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </DrawerStyled>
      <Main open={open}>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node,
};

export default DashboardLayout;
