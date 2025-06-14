import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Search from "./pages/Search";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import PrivateRoutes from "./utils/PrivateRoutes";
import ViewAll from "./pages/ViewAll";
import DuplicateAppNosPage from "./pages/Duplication"
import StudentRankingSystem from "./pages/Settings";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_EMAILS } from "./const/options";
import { Navigate } from "react-router-dom";

function App() {

  const { user } = useAuth();
  if (!user) {
    return <Login />;
  }
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/search" element={<Search />} exact />
          {ADMIN_EMAILS.includes(user.email) && (
            <>
              <Route path="/duplications" element={<DuplicateAppNosPage />} exact />
              <Route path="/settings" element={<StudentRankingSystem />} exact />
            </>
          )}
          <Route path="/search/:applicationNooo" element={<Search />} />
          <Route path="/viewall" element={<ViewAll />} exact />
          <Route path="*" element={<Navigate to='/' />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
