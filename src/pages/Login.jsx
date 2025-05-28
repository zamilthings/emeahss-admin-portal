import {
  Typography,
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Snackbar,
  Alert
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../assets/emea_logo.jpeg";
import background from "../assets/background.jpg";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from "react";

function Login() {
  const { user, setisLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const navigate = useNavigate();

  if (user) return <Navigate to="/search" replace />;

  const showToast = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setisLoading(true);
      showToast('Login successful!', 'success');
      navigate('/search');
    } catch (error) {
      let errorMessage = 'Login failed';
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credentials';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Account disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User not found';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = error.message;
          break;
      }
      showToast(errorMessage, 'error');
    } finally {
      setisLoading(false);
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen"
      style={{
        backgroundImage: `url(${background})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box className="w-5/6 md:w-5/12 md:max-w-[500px]">
        <Paper elevation={3} className="flex justify-center items-center flex-col gap-4 px-10 py-12">
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <img className="w-20 mx-auto" src={logo} alt="logo" />
            <div className="text-center">
              <Typography variant="h4" style={{ fontWeight: "bold", color: "darkblue" }}>
                EMEAHSS
              </Typography>
              <Typography variant="h6" style={{ color: "darkblue" }}>
                Admin Panel
              </Typography>
            </div>

            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              fullWidth
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button variant="contained" sx={{ py: 1.4 }} fullWidth type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Paper>
      </Box>

      {/* Snackbar Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>


    </div>
  );
}

export default Login;
