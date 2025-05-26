import {
    Box,
    Chip,
    InputAdornment,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button
} from "@mui/material";
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";


function ViewAll() {
    const [ManagementEntries, setManagementEntries] = useState([]);
    const [FilteredEntries, setFilteredEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const [, setSearchText] = useState("");

    useEffect(() => {
        FetchEntries();
    }, []);

    const FetchEntries = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "applications"));
            const data = [];

            querySnapshot.forEach((doc) => {
                data.push(doc.data());
            });

            setManagementEntries(data);
            setFilteredEntries(data);
        } catch (error) {
            console.error("Error fetching entries from Firestore:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const exportToCSV = (data, filename = "applications.csv") => {
        if (!data.length) return;

        // ✅ Define the field order explicitly
        const fields = [
            "AppNo",
            "Name",
            "MobileNumber",
            "WhatsappNumber",
            "DateOfBirth",
            "RegNumber",
            "Year",
            "Board",
            "Gender",
            "Religion",
            "FatherName",
            "MotherName",
            "SchoolName",
            "SingleWindowNo",
            "Panchayath",
            "Ward",
            "PostOffice",
            "HouseName",
            "Nominee",
            "coursePreference1",
            "coursePreference2",
            "Language1",
            "Language2",
            "English",
            "Hindi",
            "SocialScience",
            "Physics",
            "Chemistry",
            "Biology",
            "Maths",
            "IT",
            "Science",
            "TotalMark"
        ];

        // Header row
        const csvRows = [fields.join(",")];

        // Each data row
        data.forEach(entry => {
            const row = fields.map(field => {
                const value = entry[field] ?? "";
                return `"${String(value).replace(/"/g, '""')}"`; // Escape quotes
            });
            csvRows.push(row.join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setSearchText(searchValue);
        setFilteredEntries(ManagementEntries)

        const filtered = ManagementEntries.filter(
            (item) =>
                item.Name.toLowerCase().includes(searchValue) ||
                item.MobileNumber.toLowerCase().includes(searchValue)
        );
        setFilteredEntries(filtered);
    };

    return (
        <div>
            <NavBar currentPage={"View All Entries"} />
            <div className="min-h-screen flex flex-col items-center bg-slate-100 ">
                {user.email === "developer@gmail.com" && (
                    <div className="flex items-start w-full p-4">
                        <Button variant="contained" onClick={() => exportToCSV(ManagementEntries)}>
                            Export to CSV
                        </Button>
                    </div>
                )}
                <Box className="w-11/12 my-5 md:w-5/6">
                    <div className="flex flex-col md:flex-row pb-2 justify-between items-center">
                        <h3 className="font-bold text-3xl mb-4">Management Entries</h3>
                        <div className="flex items-center gap-3">
                            <TextField
                                className="bg-white"
                                id="input-with-icon-textfield"
                                placeholder="Search Name / Mob No"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                    onChange: (e) => {
                                        handleSearch(e);
                                    },
                                }}
                                size="small"
                            />
                            <p className="font-bold">Total: {FilteredEntries.length}</p>
                        </div>
                    </div>
                    <TableContainer
                        component={Paper}
                        sx={{ width: "100%", overflow: "hidden" }}
                    >
                        <div className="overflow-auto">
                            <Table
                                sx={{ minWidth: 650 }}
                                aria-label="simple table"
                                size="small"
                            >
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#dfdfdf" }}>
                                        <TableCell sx={{ fontWeight: "bold" }}>AppNo</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Mobile No</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>DOB</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Reg No</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Father</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>School</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>
                                            Panchayath & Ward
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Nominee</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Courses</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody className="overflow-auto">
                                    {FilteredEntries.map((row) => (
                                        <TableRow className="whitespace-nowrap" key={row.AppNo}>
                                            <TableCell scope="row">{row.AppNo}</TableCell>
                                            <TableCell>{row.Name}</TableCell>
                                            <TableCell>{row.MobileNumber}</TableCell>
                                            <TableCell>{row.DateOfBirth}</TableCell>
                                            <TableCell>{row.RegNumber}</TableCell>
                                            <TableCell>{row.FatherName}</TableCell>
                                            <TableCell>{row.SchoolName}</TableCell>
                                            <TableCell>{row.Gender}</TableCell>
                                            <TableCell>
                                                {row.Panchayath}, {row.Ward}
                                            </TableCell>
                                            <TableCell>{row.Nominee}</TableCell>
                                            <TableCell className="space-x-2">
                                                <Chip size="small" label={row.coursePreference1} />
                                                {row.coursePreference2 && (
                                                    <Chip size="small" label={row.coursePreference2} />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {isLoading && <LinearProgress />}
                        </div>
                    </TableContainer>
                </Box>
            </div>
        </div>
    );
}

export default ViewAll;
