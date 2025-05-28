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
    Button,
    Typography,
    Card,
    CardContent,
    Grid,
    IconButton,
    Tooltip,
    TablePagination,
    Alert,
    Skeleton,
    Badge,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack
} from "@mui/material";
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import { BanknoteArrowUp, BanknoteX, UserRoundX, UserRoundCheck, UsersRound } from 'lucide-react';

import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

function ViewAll() {
    const [allEntries, setAllEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [error, setError] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [stats, setStats] = useState({
        total: 0,
        withNominee: 0,
        withoutNominee: 0,
        paid: 0,
        unpaid: 0
    });

    const { user } = useAuth();

    useEffect(() => {
        fetchEntries();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allEntries, searchText, filterBy]);

    const fetchEntries = async () => {
        setIsLoading(true);
        setError("");

        try {
            const querySnapshot = await getDocs(collection(db, "applications"));
            const data = [];

            querySnapshot.forEach((doc) => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort by AppNo in ascending order
            data.sort((a, b) => {
                // Extract numeric parts
                const aNum = parseInt(a.AppNo?.replace('ME', '') || '0');
                const bNum = parseInt(b.AppNo?.replace('ME', '') || '0');
                return aNum - bNum;
            });

            setAllEntries(data);
            calculateStats(data);
        } catch (error) {
            console.error("Error fetching entries from Firestore:", error);
            setError("Failed to load entries. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data) => {
        const stats = {
            total: data.length,
            withNominee: data.filter(entry => entry.Nominee && entry.Nominee.trim() !== "").length,
            withoutNominee: data.filter(entry => !entry.Nominee || entry.Nominee.trim() === "").length,
            paid: data.filter(entry => entry.Payment === "PAID").length,
            unpaid: data.filter(
                entry =>
                    entry.Payment === "UNPAID" ||
                    !entry.Payment ||
                    entry.Payment.trim() === ""
            ).length

        };
        setStats(stats);
    };

    const applyFilters = () => {
        let filtered = [...allEntries];

        // Apply search filter
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.Name?.toLowerCase().includes(searchLower) ||
                    item.MobileNumber?.toLowerCase().includes(searchLower) ||
                    item.AppNo?.toLowerCase().includes(searchLower) ||
                    item.RegNumber?.toLowerCase().includes(searchLower) ||
                    item.FatherName?.toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        switch (filterBy) {
            case "withNominee":
                filtered = filtered.filter(entry => entry.Nominee && entry.Nominee.trim() !== "");
                break;
            case "withoutNominee":
                filtered = filtered.filter(entry => !entry.Nominee || entry.Nominee.trim() === "");
                break;
            case "paid":
                filtered = filtered.filter(entry => entry.Payment === "PAID");
                break;
            case "unpaid":
                filtered = filtered.filter(entry => entry.Payment === "UNPAID");
                break;
            default:
                break;
        }

        setFilteredEntries(filtered);
        setPage(0); // Reset to first page when filtering
    };

    const exportToCSV = (data, filename = "applications.csv") => {
        if (!data.length) {
            alert("No data to export");
            return;
        }

        const fields = [
            "AppNo", "Name", "MobileNumber", "WhatsappNumber", "DateOfBirth",
            "RegNumber", "Year", "Board", "Gender", "Religion", "FatherName",
            "MotherName", "SchoolName", "SingleWindowNo", "Panchayath", "Ward",
            "PostOffice", "HouseName", "Nominee", "coursePreference1",
            "coursePreference2", "Language1", "Language2", "English", "Hindi",
            "SocialScience", "Physics", "Chemistry", "Biology", "Maths", "IT",
            "Science", "TotalMark", "Payment"
        ];

        const csvRows = [fields.join(",")];

        data.forEach(entry => {
            const row = fields.map(field => {
                const value = entry[field] ?? "";
                return `"${String(value).replace(/"/g, '""')}"`;
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getPaymentChipColor = (payment) => {
        switch (payment) {
            case "PAID":
                return "success";
            case "UNPAID":
                return "error";
            default:
                return "default";
        }
    };

    const StatsCard = ({ title, value, icon, color = "primary" }) => {

        return (
            <Card
                variant="outlined"
                sx={{
                    height: "100%",
                    px: 2,
                    py: 3,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    borderRadius: 2,
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            {value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>
                    </Box>
                    <Box>
                        {icon}
                    </Box>
                </CardContent>
            </Card>
        );
    };


    // Paginated data
    const paginatedEntries = filteredEntries.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <div>
            <NavBar currentPage={"View All Entries"} />
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 3 }}>
                <Box sx={{ maxWidth: '95%', mx: 'auto' }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                            {error}
                        </Alert>
                    )}

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatsCard
                                title="Total Applications"
                                value={stats.total}
                                icon={<UsersRound color="#1976d2" size={35} />}
                                color="primary"
                                iconColor="#0c4a6e"
                            />

                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatsCard
                                title="With Nominee"
                                value={stats.withNominee}
                                icon={<UserRoundCheck color="#2e7d32" size={35} />}
                                color="success"
                                iconColor="#065f46"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>

                            <StatsCard
                                title="Without Nominee"
                                value={stats.withoutNominee}
                                icon={<UserRoundX color="#ed6c02" size={35} />}
                                color="warning"
                                iconColor="#b45309"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>

                            <StatsCard
                                title="Paid"
                                value={stats.paid}
                                icon={<BanknoteArrowUp color="#2e7d32" size={35} />}
                                color="success"
                                iconColor="#0f766e"
                            />

                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatsCard
                                title="Unpaid"
                                value={stats.unpaid}
                                icon={<BanknoteX color="#d32f2f" size={35} />}
                                color="error"
                                iconColor="#b91c1c"
                            />
                        </Grid>
                    </Grid>


                    {/* Header and Controls */}
                    <Paper sx={{ p: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 2 }}>
                            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
                                Management Entries
                            </Typography>

                            {user?.email === "developer@gmail.com" && (
                                <Stack direction="row" spacing={1}>
                                    <Tooltip title="Refresh Data">
                                        <IconButton onClick={fetchEntries} disabled={isLoading} color="primary">
                                            <RefreshIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => exportToCSV(filteredEntries)}
                                        disabled={!filteredEntries.length}
                                    >
                                        Export CSV
                                    </Button>
                                </Stack>
                            )}
                        </Box>

                        {/* Search and Filter Controls */}
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search by Name, Mobile, App No, Reg No, or Father's Name"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ flexGrow: 1 }}
                            />

                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Filter By</InputLabel>
                                <Select
                                    value={filterBy}
                                    label="Filter By"
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} />}
                                >
                                    <MenuItem value="all">All Entries</MenuItem>
                                    <MenuItem value="withNominee">With Nominee</MenuItem>
                                    <MenuItem value="withoutNominee">Without Nominee</MenuItem>
                                    <MenuItem value="paid">Paid</MenuItem>
                                    <MenuItem value="unpaid">Unpaid</MenuItem>
                                </Select>
                            </FormControl>

                            <Badge badgeContent={filteredEntries.length} color="primary" max={9999}>
                                <Typography variant="body1" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                                    Results
                                </Typography>
                            </Badge>
                        </Box>
                    </Paper>

                    {/* Table */}
                    <Paper sx={{ overflow: 'hidden' }}>
                        {isLoading && <LinearProgress />}

                        <TableContainer sx={{ maxHeight: '70vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        {[
                                            "App No", "Name", "Mobile", "DOB", "Reg No",
                                            "Father", "School", "Gender", "Location",
                                            "Nominee", "Payment", "Courses"
                                        ].map((header) => (
                                            <TableCell
                                                key={header}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {header}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        // Loading skeletons
                                        Array.from(new Array(5)).map((_, index) => (
                                            <TableRow key={index}>
                                                {Array.from(new Array(12)).map((_, cellIndex) => (
                                                    <TableCell key={cellIndex}>
                                                        <Skeleton variant="text" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : paginatedEntries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                                                <Typography variant="h6" color="text.secondary">
                                                    No entries found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedEntries.map((row, index) => (
                                            <TableRow
                                                key={row.AppNo || index}
                                                sx={{
                                                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                    '&:hover': { bgcolor: 'action.selected' }
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {row.AppNo}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'medium' }}>
                                                    {row.Name}
                                                </TableCell>
                                                <TableCell>{row.MobileNumber}</TableCell>
                                                <TableCell>{row.DateOfBirth}</TableCell>
                                                <TableCell>{row.RegNumber}</TableCell>
                                                <TableCell>{row.FatherName}</TableCell>
                                                <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    <Tooltip title={row.SchoolName || ""}>
                                                        <span>{row.SchoolName}</span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={row.Gender}
                                                        size="small"
                                                        color={row.Gender === 'Male' ? 'primary' : 'secondary'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {row.Panchayath && row.Ward ? `${row.Panchayath}, ${row.Ward}` : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {row.Nominee ? (
                                                        <Chip
                                                            label={row.Nominee}
                                                            size="small"
                                                            color="success"
                                                            variant="filled"
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label="Not Assigned"
                                                            size="small"
                                                            color="warning"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {row.Payment && (
                                                        <Chip
                                                            label={row.Payment}
                                                            size="small"
                                                            color={getPaymentChipColor(row.Payment)}
                                                            variant="filled"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {row.coursePreference1 && (
                                                            <Chip
                                                                label={row.coursePreference1}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                        {row.coursePreference2 && (
                                                            <Chip
                                                                label={row.coursePreference2}
                                                                size="small"
                                                                color="secondary"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            component="div"
                            count={filteredEntries.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{ borderTop: 1, borderColor: 'divider' }}
                        />
                    </Paper>
                </Box>
            </Box>
        </div>
    );
}

export default ViewAll;