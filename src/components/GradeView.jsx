import { Table, TableBody, TableCell, TableRow } from "@mui/material"
import { cbseMarksToGrade, stateMarksToGrade } from "../const/marksGrades"


function GradeView({ student }) {



    return (
        <> {student.Board === "Other" || student.Board === "STATE" ? (
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
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="9%">
                            <b>Total Mark</b>
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
                            {stateMarksToGrade[student.Language1]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                            {stateMarksToGrade[student.Language2]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                            {stateMarksToGrade[student.English]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                            {stateMarksToGrade[student.Hindi]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                            {stateMarksToGrade[student.SocialScience]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                            {stateMarksToGrade[student.Physics]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                            {stateMarksToGrade[student.Chemistry]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                            {stateMarksToGrade[student.Biology]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                            {stateMarksToGrade[student.Maths]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }}>
                            {stateMarksToGrade[student.IT]}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }} style={{ fontWeight: "bold", color: "#000" }}>
                            {student?.TotalMark}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        ) : student.Board === "CBSE" ? (
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
                        <TableCell sx={{ borderRight: "1px solid #d8dceb" }} width="15%">
                            <b>Total Mark</b>
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
                            {cbseMarksToGrade[student.Language2]}
                        </TableCell>
                        <TableCell
                            sx={{ borderRight: "1px solid #d8dceb" }}
                            width="200px"
                        >
                            {cbseMarksToGrade[student.English]}
                        </TableCell>
                        <TableCell
                            sx={{ borderRight: "1px solid #d8dceb" }}
                            width="200px"
                        >
                            {cbseMarksToGrade[student.Maths]}
                        </TableCell>
                        <TableCell
                            sx={{ borderRight: "1px solid #d8dceb" }}
                            width="200px"
                        >
                            {cbseMarksToGrade[student.SocialScience]}
                        </TableCell>
                        <TableCell
                            sx={{ borderRight: "1px solid #d8dceb" }}
                            width="200px"
                        >
                            {cbseMarksToGrade[student.Science]}
                        </TableCell>
                        <TableCell
                            sx={{ borderRight: "1px solid #d8dceb" }}
                            width="200px"
                            style={{ fontWeight: "bold", color: "#000" }}
                        >
                            {student?.TotalMark}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        ) : null}</>
    )
}

export default GradeView