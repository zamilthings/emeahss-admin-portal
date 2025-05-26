import { Snackbar, Alert } from "@mui/material";

function SuccessAlert({ open, handleClose, message }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity="success" sx={{ width: "100%" }} variant="filled" onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default SuccessAlert;
