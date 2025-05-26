import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Search from "./pages/Search";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import PrivateRoutes from "./utils/PrivateRoutes";
import ViewAll from "./pages/ViewAll";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/search" element={<Search />} exact />
          <Route path="/viewall" element={<ViewAll />} exact />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
