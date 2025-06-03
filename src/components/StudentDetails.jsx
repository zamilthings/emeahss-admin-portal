import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormHelperText,
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from '@mui/icons-material/Clear';
import { useState } from "react";
// import axios from "axios";
import Loader from "./Loader";
import { cbseGradesOptions, courseOptions, examOptions, genderOptions, panchayatOptions, religionOptions, stateGradesOptions } from "../const/options";
import GradeView from "./GradeView";
import { format, parse, isValid } from 'date-fns';


import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";



function StudentDetails({ data, isManagement }) {

  const [editMode, setEditMode] = useState(false);



  const [student, setStudent] = useState(data[0]);

  const [editData, setEditData] = useState(data[0]);

  const [isloading, setIsloading] = useState(false);

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
    console.log(e)
  };

  const handleBoardChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
      Language1: "",
      Language2: "",
      Hindi: "",
      English: "",
      SocialScience: "",
      Physics: "",
      Chemistry: "",
      Biology: "",
      Maths: "",
      IT: "",
      Science: "",
    });
  };




  const updateData = (data) => {
    const updatedData = {
      ...data,
      AppNo: student.AppNo,
    };
    setStudent(
      updatedData
    )
  }

  const calculateTotalMark = (values) => {
    const subjectKeys = [
      "Language1", "Language2", "English", "Hindi", "SocialScience",
      "Physics", "Chemistry", "Biology", "Maths", "IT", "Science"
    ];

    let total = 0;

    subjectKeys.forEach((key) => {
      const grade = values[key];
      const point = Number(grade);
      if (!isNaN(point)) {
        total += point;
      }
    });

    return total;
  };


  const handleSubmit = async () => {
    setEditMode(false);
    setIsloading(true);

    const TotalMark = calculateTotalMark(editData);

    try {
      const docRef = doc(db, "applications", editData.MobileNumber);

      // Perform the update
      await updateDoc(docRef, {
        ...editData,
        TotalMark,
      });

      // Fetch the updated document
      const updatedSnap = await getDoc(docRef);

      if (updatedSnap.exists()) {
        const updatedData = updatedSnap.data();
        updateData(updatedData); // update UI
      }

      setIsloading(false);
    } catch (error) {
      if (error.code === 'permission-denied') {
        alert("You do not have permission to update this document.");
      }
      console.log("Update failed:", error);
      setIsloading(false);
    }
  };

  function parseDOB(dobString) {
    // Try parsing as MM/DD/YYYY (new format)
    let parsedDate = parse(dobString, 'MM/dd/yyyy', new Date());
    if (!isValid(parsedDate)) {
      // Fallback: Try parsing as DD/MM/YYYY (old format)
      parsedDate = parse(dobString, 'dd/MM/yyyy', new Date());
    }
    return isValid(parsedDate) ? format(parsedDate, 'dd/MM/yyyy') : 'Invalid date';
  }

  return (
    <TableContainer component={Paper} className="mt-3 p-2">
      {isloading && <Loader />}
      <Table aria-label="simple table" className="text-red-500">
        <TableHead  >
          <TableRow>
            <TableCell colSpan={2} className="py-3 bg-slate-100 rounded-md">
              <div className="flex justify-between items-center">
                <Typography variant="" className="font-semibold text-sm md:text-3xl px-2">
                  Student&apos;s Details  <span className="text-blue-700">{student.AppNo}</span>
                </Typography>

                {editMode ?
                  <div className="space-x-2" >
                    <Tooltip title="Cancel">
                      <Button variant="outlined" onClick={() => { setEditMode(false); setEditData(data[0]); setStudent(data[0]) }} >
                        <ClearIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Save">
                      <Button color="success" variant="contained" onClick={handleSubmit} >
                        <SaveIcon />
                      </Button>
                    </Tooltip>
                  </div>
                  :
                  <Tooltip title="Edit">
                    <Button variant="outlined" onClick={() => { setEditMode(true) }} >
                      <EditIcon />
                    </Button>
                  </Tooltip>
                }

              </div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell  >
              <b>Name: </b>
              {editMode ?
                <TextField type="text" name="Name" size="small" variant="outlined" onChange={handleChange} value={editData.Name} /> :
                <>{student.Name}</>
              }
            </TableCell>
            {student.Nominee && (
              <TableCell
                sx={{
                  color: "green",
                }}
              >
                <b>Nominee: </b>
                {student.Nominee}
              </TableCell>
            )}
            {student.Payment && (
              <TableCell
                sx={{
                  color: student.Payment === "PAID" ? "green" : "red",
                }}
              >
                <b>Payment: </b>
                {student.Payment}
              </TableCell>
            )}
          </TableRow>

          <TableRow>
            <TableCell>
              <b>Mobile Number: </b>
              {editMode ?
                <TextField disabled type="text" name="MobileNumber" size="small" variant="outlined" onChange={handleChange} value={editData.MobileNumber} /> :
                <>{student.MobileNumber}</>
              }
            </TableCell>
            <TableCell>
              <b>Whatsapp Number: </b>
              {editMode ?
                <TextField type="text" name="WhatsappNumber" size="small" variant="outlined" onChange={handleChange} value={editData.WhatsappNumber} /> :
                <>{student.WhatsappNumber}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={2}>
              <b>Single Window Number: </b>
              {editMode ?
                <TextField type="text" name="SingleWindowNo" size="small" variant="outlined" onChange={handleChange} value={editData.SingleWindowNo} /> :
                <>{student.SingleWindowNo}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={2}>
              <b>Date of Birth: </b>
              {editMode ?
                <TextField type="text" name="DateOfBirth" size="small" variant="outlined" onChange={handleChange} value={editData.DateOfBirth} disabled /> :
                <>{parseDOB(student.DateOfBirth)}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <b>Gender: </b>
              {editMode ?
                <Select
                  size="small"
                  value={editData.Gender}
                  onChange={handleChange}
                  name="Gender"
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select> :
                <>{student.Gender}</>
              }

            </TableCell>
            <TableCell>
              <b>Religion: </b>
              {editMode ?
                <Select
                  size="small"
                  value={editData.Religion}
                  onChange={handleChange}
                  name="Religion"
                >
                  {religionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select> :
                <>{student.Religion}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <b>Register Number: </b>
              {editMode ?
                <TextField type="text" name="RegNumber" size="small" variant="outlined" onChange={handleChange} value={editData.RegNumber} /> :
                <>{student.RegNumber}</>
              }
            </TableCell>
            <TableCell>
              <b>Year: </b>
              {editMode ?
                <TextField type="text" name="Year" size="small" variant="outlined" onChange={handleChange} value={editData.Year} /> :
                <> {student.Year}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={2}>
              <b>Board of Examination: </b>
              {editMode ?
                <>
                  <Select
                    size="small"
                    value={editData.Board}
                    onChange={handleBoardChange}
                    name="Board"
                  >
                    {examOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText sx={{ color: "orange" }} >Changing the board will erase the previous grades, so please re-enter them.</FormHelperText>
                </>
                :
                <>{student.Board}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={2}>
              <div className="flex gap-1">
                <b>School Name: </b>
                {editMode ?
                  <TextField type="text" name="SchoolName" size="small" variant="outlined" className="w-2/4" onChange={handleChange} value={editData.SchoolName} />
                  :
                  <>
                    {student.SchoolName}
                  </>
                }
              </div>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={2}>
              <b>Father Name: </b>
              {editMode ?
                <TextField type="text" name="FatherName" size="small" variant="outlined" onChange={handleChange} value={editData.FatherName} /> :
                <>{student.FatherName}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell colSpan={2}>
              <b>Mother Name: </b>
              {editMode ?
                <TextField type="text" name="MotherName" size="small" variant="outlined" onChange={handleChange} value={editData.MotherName} /> :
                <>{student.MotherName}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <b>House Name: </b>
              {editMode ?
                <TextField type="text" name="HouseName" size="small" variant="outlined" onChange={handleChange} value={editData.HouseName} /> :
                <>{student.HouseName}</>
              }
            </TableCell>
            <TableCell>
              <b>Post Office: </b>
              {editMode ?
                <TextField type="text" name="PostOffice" size="small" variant="outlined" onChange={handleChange} value={editData.PostOffice} /> :
                <>{student.PostOffice}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <b>Panchayath: </b>
              {editMode ?
                <Select
                  size="small"
                  value={editData.Panchayath}
                  onChange={handleChange}
                  name="Panchayath"
                >
                  {panchayatOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select> :
                <> {student.Panchayath}</>
              }
            </TableCell>
            <TableCell>
              <b>Ward: </b>
              {editMode ?
                <TextField type="text" name="Ward" size="small" variant="outlined" onChange={handleChange} value={editData.Ward} /> :
                <> {student.Ward}</>
              }
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {editMode ? (<> {editData.Board === "Other" || editData.Board === "STATE" ? (
        <Table
          sx={{
            marginTop: "40px",
            borderTop: "1px solid #d8dceb",
            borderBottom: "1px solid #d8dceb",
          }}
        >
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#d8dceb",
                  borderColor: "#b6b8bf",
                  border: "1px solid #b6b8bf",
                }}
                width="5%"
              >
                <b>Subject</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>Lang 1</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>Lang 2</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>English</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>Hindi</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>SS</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>Physics</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>Chemistry</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>Biology</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>Maths</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                <b>IT</b>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#d8dceb",
                  borderColor: "#b6b8bf",
                  border: "1px solid #b6b8bf",
                }}
              >
                <b>Grade</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.Language1}
                  onChange={handleChange}
                  name="Language1"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.Language2}
                  onChange={handleChange}
                  name="Language2"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.English}
                  onChange={handleChange}
                  name="English"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.Hindi}
                  onChange={handleChange}
                  name="Hindi"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.SocialScience}
                  onChange={handleChange}
                  name="SocialScience"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.Physics}
                  onChange={handleChange}
                  name="Physics"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.Chemistry}
                  onChange={handleChange}
                  name="Chemistry"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.Biology}
                  onChange={handleChange}
                  name="Biology"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.Maths}
                  onChange={handleChange}
                  name="Maths"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                <Select
                  size="small"
                  value={editData.IT}
                  onChange={handleChange}
                  name="IT"
                >
                  {stateGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : editData.Board === "CBSE" ? (
        <Table
          sx={{
            marginTop: "40px",
            borderTop: "1px solid #d8dceb",
            borderBottom: "1px solid #d8dceb",
          }}
        >
          <TableBody>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#d8dceb",
                  borderColor: "#b6b8bf",
                  border: "1px solid #b6b8bf",
                }}
                width="10%"
              >
                <b>Subject</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="15%">
                <b>Language</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="15%">
                <b>English</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="15%">
                <b>Maths</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="15%">
                <b>SS</b>
              </TableCell>
              <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="15%">
                <b>Science</b>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#d8dceb",
                  borderColor: "#b6b8bf",
                  border: "1px solid #b6b8bf",
                }}
                width="200px"
              >
                <b>Grade</b>
              </TableCell>
              <TableCell
                sx={{ borderRight: "1px solid #d8dceb" }}
                width="200px"
              >
                <Select
                  size="small"
                  value={editData.Language2}
                  onChange={handleChange}
                  name="Language2"
                >
                  {cbseGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell
                sx={{ borderRight: "1px solid #d8dceb" }}
                width="200px"
              >
                <Select
                  size="small"
                  value={editData.English}
                  onChange={handleChange}
                  name="English"
                >
                  {cbseGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell
                sx={{ borderRight: "1px solid #d8dceb" }}
                width="200px"
              >
                <Select
                  size="small"
                  value={editData.Maths}
                  onChange={handleChange}
                  name="Maths"
                >
                  {cbseGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell
                sx={{ borderRight: "1px solid #d8dceb" }}
                width="200px"
              >
                <Select
                  size="small"
                  value={editData.SocialScience}
                  onChange={handleChange}
                  name="SocialScience"
                >
                  {cbseGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell
                sx={{ borderRight: "1px solid #d8dceb" }}
                width="200px"
              >
                <Select
                  size="small"
                  value={editData.Science}
                  onChange={handleChange}
                  name="Science"
                >
                  {cbseGradesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : null}</>) : (<GradeView student={student} />)}


      <Table
        sx={{
          marginTop: "40px",
          marginBottom: "20px",
          borderTop: "1px solid #b6b8bf",
          borderBottom: "1px solid #d8dceb",
        }}
      >
        <TableBody>
          <TableRow sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}>
            <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
              <b>Preference</b>
            </TableCell>
            <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
              <b>Course</b>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
              <b>1</b>
            </TableCell>
            <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
              {editMode ?
                <Select
                  size="small"
                  value={editData.coursePreference1}
                  onChange={handleChange}
                  name="coursePreference1"
                  fullWidth
                >
                  {courseOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select> :
                <>{student.coursePreference1}</>
              }
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
              <b>2</b>
            </TableCell>
            <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
              {editMode ?
                <Select
                  size="small"
                  value={editData.coursePreference2}
                  onChange={handleChange}
                  name="coursePreference2"
                  fullWidth
                >
                  {courseOptions.filter((option) => option.value !== editData.coursePreference1).map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select> :
                <>{student.coursePreference2}</>
              }
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {!isManagement ? (
        <>
          <Table sx={{ marginTop: "20px" }}>
            <TableBody>
              <TableRow>
                <TableCell>
                  <b>
                    Whether the applicant is eligible for bonus points under the
                    following category : &nbsp;
                  </b>
                  {editMode ?
                    <TextField type="text" name="ExtraCurricular" size="small" variant="outlined" onChange={handleChange} value={editData.ExtraCurricular} /> :
                    <> {student.ExtraCurricular}</>
                  }

                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontSize: "18px" }}>
                  <b>Participation in Sports</b>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>
                    State Level Participation(Number of items participated) : &nbsp;
                  </b>
                  {editMode ?
                    <TextField type="number" name="SportsStateLevel" size="small" variant="outlined" onChange={handleChange} value={editData.SportsStateLevel} /> :
                    <> {student.SportsStateLevel}</>
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>District Level</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table sx={{ marginBottom: "20px" }}>
            <TableBody>
              <TableRow
                sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}
              >
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  <b>A Grade</b>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  <b>B Grade</b>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  <b>C Grade</b>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  <b>Participation</b>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                  {editMode ?
                    <TextField type="number" name="SportsDistrictA" size="small" variant="outlined" onChange={handleChange} value={editData.SportsDistrictA} /> :
                    <>{student.SportsDistrictA}</>
                  }

                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                  {editMode ?
                    <TextField type="number" name="SportsDistrictB" size="small" variant="outlined" onChange={handleChange} value={editData.SportsDistrictB} /> :
                    <>{student.SportsDistrictB}</>
                  }
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                  {editMode ?
                    <TextField type="number" name="SportsDistrictC" size="small" variant="outlined" onChange={handleChange} value={editData.SportsDistrictC} /> :
                    <>{student.SportsDistrictC}</>
                  }
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                  {editMode ?
                    <TextField type="number" name="SportsDistrictParticipation" size="small" variant="outlined" onChange={handleChange} value={editData.SportsDistrictParticipation} /> :
                    <>{student.SportsDistrictParticipation}</>
                  }
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontSize: "18px" }}>
                  <b>Participation in Kerala School Kalotsavam</b>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>
                    State Level Participation(Number of items participated) :&nbsp;
                  </b>
                  {editMode ?
                    <TextField type="number" name="KalotsavamStateLevel" size="small" variant="outlined" onChange={handleChange} value={editData.KalotsavamStateLevel} /> :
                    <>{student.KalotsavamStateLevel}</>
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>District Level</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table sx={{ marginBottom: "20px" }}>
            <TableBody>
              <TableRow
                sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}
              >
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  <b>A Grade</b>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  <b>B Grade</b>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  <b>C Grade</b>
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  <b>Participation</b>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                  {editMode ?
                    <TextField type="number" name="ArtsDistrictA" size="small" variant="outlined" onChange={handleChange} value={editData.ArtsDistrictA} /> :
                    <>{student.ArtsDistrictA}</>
                  }
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                  {editMode ?
                    <TextField type="number" name="ArtsDistrictB" size="small" variant="outlined" onChange={handleChange} value={editData.ArtsDistrictB} /> :
                    <>{student.ArtsDistrictB}</>
                  }
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                  {editMode ?
                    <TextField type="number" name="ArtsDistrictC" size="small" variant="outlined" onChange={handleChange} value={editData.ArtsDistrictC} /> :
                    <>{student.ArtsDistrictC}</>
                  }
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                  {editMode ?
                    <TextField type="number" name="ArtsDistrictParticipation" size="small" variant="outlined" onChange={handleChange} value={editData.ArtsDistrictParticipation} /> :
                    <>{student.ArtsDistrictParticipation}</>
                  }
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <b>
                    Whether qualified in the National/State Level Test for the
                    National Talent Search Examination : &nbsp;
                  </b>
                  {editMode ?
                    <TextField type="text" name="NationalOrStateLevelExamination" size="small" variant="outlined" onChange={handleChange} value={editData.NationalOrStateLevelExamination} /> :
                    <>{student.NationalOrStateLevelExamination}</>
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>
                    (a) Details of participation in co-curricular activites and
                    the number of grades won
                  </b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table sx={{ marginBottom: "20px" }}>
            <TableBody>
              <TableRow
                sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}
              >
                <TableCell
                  sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}
                ></TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  A Grade
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  B Grade
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  C Grade
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  D Grade
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #b6b8bf" }}>
                  E Grade
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}>
                  State Science Fair
                </TableCell>
                {["A", "B", "C", "D", "E"].map((letter) => (
                  <TableCell key={`StateScienceFair${letter}`} sx={{ borderRight: "1px solid #d8dceb" }}>
                    {editMode ? (
                      <TextField
                        type="number"
                        name={`StateScienceFair${letter}`}
                        size="small"
                        variant="outlined"
                        onChange={handleChange}
                        value={editData[`StateScienceFair${letter}`] || ""}
                      />
                    ) : (
                      <>{student[`StateScienceFair${letter}`] || "-"}</>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}>
                  State Social Fair
                </TableCell>
                {["A", "B", "C", "D", "E"].map((letter) => (
                  <TableCell key={`StateSocialFair${letter}`} sx={{ borderRight: "1px solid #d8dceb" }}>
                    {editMode ? (
                      <TextField
                        type="number"
                        name={`StateSocialFair${letter}`}
                        size="small"
                        variant="outlined"
                        onChange={handleChange}
                        value={editData[`StateSocialFair${letter}`] || ""}
                      />
                    ) : (
                      <>{student[`StateSocialFair${letter}`] || "-"}</>
                    )}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}>
                  State Maths Fair
                </TableCell>
                {["A", "B", "C", "D", "E"].map((letter) => (
                  <TableCell key={`StateMathsFair${letter}`} sx={{ borderRight: "1px solid #d8dceb" }}>
                    {editMode ? (
                      <TextField
                        type="number"
                        name={`StateMathsFair${letter}`}
                        size="small"
                        variant="outlined"
                        onChange={handleChange}
                        value={editData[`StateMathsFair${letter}`] || ""}
                      />
                    ) : (
                      <>{student[`StateMathsFair${letter}`] || "-"}</>
                    )}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}>
                  State IT Fest
                </TableCell>
                {["A", "B", "C", "D", "E"].map((letter) => (
                  <TableCell key={`StateITFest${letter}`} sx={{ borderRight: "1px solid #d8dceb" }}>
                    {editMode ? (
                      <TextField
                        type="number"
                        name={`StateITFest${letter}`}
                        size="small"
                        variant="outlined"
                        onChange={handleChange}
                        value={editData[`StateITFest${letter}`] || ""}
                      />
                    ) : (
                      <>{student[`StateITFest${letter}`] || "-"}</>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell sx={{ backgroundColor: "#d8dceb", borderColor: "#b6b8bf" }}>
                  State Work Experience Fair
                </TableCell>
                {["A", "B", "C", "D", "E"].map((letter) => (
                  <TableCell key={`StateWorkExperienceFair${letter}`} sx={{ borderRight: "1px solid #d8dceb" }}>
                    {editMode ? (
                      <TextField
                        type="number"
                        name={`StateWorkExperienceFair${letter}`}
                        size="small"
                        variant="outlined"
                        onChange={handleChange}
                        value={editData[`StateWorkExperienceFair${letter}`] || ""}
                      />
                    ) : (
                      <>{student[`StateWorkExperienceFair${letter}`] || "-"}</>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <b>(b) Relevant</b>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ paddingLeft: "50px" }}>
                  {editMode ?
                    <TextField type="text" name="Club" size="small" variant="outlined" onChange={handleChange} value={editData.Club} /> :
                    <> {student.Club}</>
                  }
                </TableCell>
              </TableRow>
            </TableBody>

          </Table>
        </>
      ) : null}
    </TableContainer>
  );
}

export default StudentDetails;
