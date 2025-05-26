import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Autocomplete,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import NavBar from "../components/NavBar";
// import axios from "axios";
import { nomineesOptions } from "../const/options";
import StudentDetails from "../components/StudentDetails";
import WarningAlert from "../components/alerts/WarningAlert";
import SuccessAlert from "../components/alerts/SuccessAlert";

import { db } from '@/config/firebase'; // your initialized Firestore DB
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";


function Search() {

  const [applicationNo, setApplicationNo] = useState("");
  const [studentDetails, setStudentDetails] = useState({});
  const [selectedNominee, setSelectedNominee] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isManagementQuota] = useState(true);

  const [openSuccessAlert, setOpenSuccessAlert] = useState(false);
  const [openWarningAlert, setOpenWarningAlert] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setStudentDetails({});
    setOpenWarningAlert(false);

    if (applicationNo === "ME000" || applicationNo === "CE0000") {
      alert("Access Denied");
      setOpenWarningAlert(true);
      return;
    }

    try {
      const quotaCollection = "applications"; // Default collection for both quotas
      // Query to find the application by AppNo
      const q = query(
        collection(db, quotaCollection),
        where("AppNo", "==", applicationNo)
      );
      const querySnapshot = await getDocs(q);
      console.log("Query Snapshot:", querySnapshot);

      if (!querySnapshot.empty) {
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(results);
        setStudentDetails(results);
        setSelectedNominee("");
        setPaymentStatus("");
      } else {
        setOpenWarningAlert(true);
      }
    } catch (error) {
      console.error("Search Error:", error);
      alert("Something went wrong while searching.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentDetails.length) return;

    const quotaCollection = "applications";
    const student = studentDetails[0];
    const studentRef = doc(db, quotaCollection, student.id);

    try {
      if (isManagementQuota) {
        await updateDoc(studentRef, {
          Nominee: selectedNominee || "",
          Payment: paymentStatus || ""
        });
      } else {
        await updateDoc(studentRef, {
          Payment: paymentStatus || ""
        });
      }

      setOpenSuccessAlert(true);
      setStudentDetails({});
    } catch (error) {
      console.error("Update Error:", error);
      alert("Something went wrong while updating.");
    }
  };




  const handleCloseWarningAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenWarningAlert(false);
  };

  const handleCloseSuccessAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSuccessAlert(false);
  };

  return (
    <>
      <NavBar currentPage={"Search Application"} />
      <div className="min-h-screen flex flex-col items-center bg-slate-100 ">
        <Box className="w-11/12 my-5 md:w-5/6">
          <Paper className="p-4">
            <div className="flex items-center justify-center gap-2 flex-col pb-4">
              <h3 className="font-bold text-3xl">Search {isManagementQuota ? "Management" : "Community"} Application</h3>
              {/* <ToggleButtonGroup
                color="primary"
                value={isManagementQuota}
                exclusive
                onChange={() => {
                  setIsManagementQuota((prev) => !prev);
                  setStudentDetails({});
                }}
              >
                <ToggleButton value={true} size="small">
                  Management
                </ToggleButton>
                <ToggleButton value={false} size="small">
                  Community
                </ToggleButton>
              </ToggleButtonGroup> */}
            </div>
            <div className="flex gap-3 mt-4">
              {/* Student Search Form */}

              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-3 md:flex-row w-full"
              >
                <TextField
                  label="Application No."
                  value={applicationNo}
                  onChange={(e) => setApplicationNo(e.target.value)}
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" color="primary">
                  <SearchIcon />
                </Button>
              </form>

              {/* Nominee Add Form */}

              {isManagementQuota ? (
                <form
                  className="flex flex-col gap-3 md:flex-row w-full"
                  onSubmit={handleSubmit}
                >
                  <FormControl fullWidth>
                    <Autocomplete
                      disabled={!studentDetails.length}
                      freeSolo
                      inputValue={selectedNominee}
                      onInputChange={(event, newInputValue) => {
                        setSelectedNominee(newInputValue);
                      }}
                      options={nomineesOptions.map((option) => option)}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Nominee" />
                      )}
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={paymentStatus}
                      label="Payment Status"
                      disabled={!studentDetails.length}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                      <MenuItem value={"PAID"}>PAID</MenuItem>
                      <MenuItem value={"UNPAID"}>UNPAID</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    type="submit"
                    disabled={!studentDetails.length}
                    variant="contained"
                    color="success"
                  >
                    <CheckIcon />
                  </Button>
                </form>
              ) : (
                <form
                  className="flex flex-col gap-3 md:flex-row w-full"
                  onSubmit={handleSubmit}
                >
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={paymentStatus}
                      label="Payment Status"
                      disabled={!studentDetails.length}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                      <MenuItem value={"PAID"}>PAID</MenuItem>
                      <MenuItem value={"UNPAID"}>UNPAID</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    type="submit"
                    disabled={!studentDetails.length}
                    variant="contained"
                    color="success"
                  >
                    <CheckIcon />
                  </Button>
                </form>
              )}
            </div>
          </Paper>
          {studentDetails.length && (
            <StudentDetails
              data={studentDetails}
              isManagement={isManagementQuota}
            />
          )}
        </Box>
      </div>
      <WarningAlert
        open={openWarningAlert}
        handleClose={handleCloseWarningAlert}
        message="Application not found!"
      />
      <SuccessAlert
        open={openSuccessAlert}
        handleClose={handleCloseSuccessAlert}
        message="Application Successfully Updated"
      />
    </>
  );
}

export default Search;
