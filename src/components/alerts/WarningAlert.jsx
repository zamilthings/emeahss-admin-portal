import { Snackbar, Alert } from "@mui/material";

function WarningAlert({ open, handleClose, message }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity="warning" sx={{ width: "100%" }} variant="filled" onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default WarningAlert;
