import { AppBar, Box, Button, Menu, MenuItem, Toolbar, Typography } from "@mui/material"
import LogoutBtn from "./auth/LogoutBtn"
import { useAuth } from "@/context/AuthContext";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logo from "../assets/emea_logo.jpeg"
import { useState } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { ADMIN_EMAILS } from "../const/options";

function NavBar({ currentPage }) {

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { user } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <div className="flex justify-between w-full items-center">
            <div className="flex gap-8">
              <img className="w-10 rounded-sm my-2" src={Logo} alt="logo" />
              <Button
                id="basic-button"
                color="inherit"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                size="small"
              >
                {currentPage} <KeyboardArrowDown />
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <Link to={"/search"}>
                  <MenuItem onClick={handleClose}>Search Application</MenuItem>
                </Link>
                <Link to={"/viewall"}>
                  <MenuItem onClick={handleClose}>View All Entries</MenuItem>
                </Link>
                {ADMIN_EMAILS.includes(user.email) && (
                  <>
                    <Link to={"/duplications"}>
                      <MenuItem onClick={handleClose}>Duplication</MenuItem>
                    </Link>
                    <Link to={"/settings"}>
                      <MenuItem onClick={handleClose}>Settings</MenuItem>
                    </Link>
                  </>
                )}
              </Menu>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex"  >
                <AccountCircleIcon />
                <Typography className="px-2 hidden md:block">{user?.email}</Typography>
              </div>
              <LogoutBtn />
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default NavBar