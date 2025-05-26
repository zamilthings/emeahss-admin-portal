
import { useAuth } from "@/context/AuthContext";
import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

function LogoutBtn() {
  const { handleSignOut, user } = useAuth();

  return (
    user && (
      <Button
        variant="contained"
        color="error"
        onClick={() => handleSignOut()}
        endIcon={<LogoutIcon />}
      >
        Logout
      </Button>
    )
  );
}

export default LogoutBtn;
