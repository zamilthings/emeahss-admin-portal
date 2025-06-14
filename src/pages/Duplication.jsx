import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    CircularProgress,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Box,
    Container,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavBar from '../components/NavBar';
import { useAuth } from "@/context/AuthContext";
import { ADMIN_EMAILS } from "../const/options";

const DuplicateAppNosPage = () => {
    const [duplicates, setDuplicates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchAndCalculateDuplicates();
    }, []);

    const fetchAndCalculateDuplicates = async () => {
        setIsLoading(true);
        setError('');

        try {
            const querySnapshot = await getDocs(collection(db, "applications"));
            const data = [];

            querySnapshot.forEach((doc) => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Find duplicates and calculate stats
            const { duplicates, stats } = processDuplicateData(data);
            setDuplicates(duplicates);
            setStats(stats);
        } catch (error) {
            console.error("Error fetching entries:", error);
            setError("Failed to load data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const processDuplicateData = (data) => {
        const appNoCounts = {};
        const appNoGroups = {};

        // Count and group entries by AppNo
        data.forEach(entry => {
            const appNo = entry.AppNo || 'MISSING';
            appNoCounts[appNo] = (appNoCounts[appNo] || 0) + 1;

            if (!appNoGroups[appNo]) {
                appNoGroups[appNo] = [];
            }
            appNoGroups[appNo].push(entry);
        });

        // Filter for duplicates (count > 1)
        const duplicateAppNos = Object.keys(appNoCounts).filter(appNo => appNoCounts[appNo] > 1);

        // Create detailed duplicates array
        const duplicates = duplicateAppNos.map(appNo => ({
            appNo,
            count: appNoCounts[appNo],
            entries: appNoGroups[appNo]
        }));

        // Calculate statistics
        const stats = {
            totalEntries: data.length,
            uniqueAppNos: Object.keys(appNoCounts).length,
            duplicateAppNos: duplicateAppNos.length,
            duplicateEntries: duplicates.reduce((sum, dup) => sum + dup.count - 1, 0),
            mostDuplicated: duplicates.length > 0
                ? duplicates.reduce((max, current) => (current.count > max.count ? current : max), duplicates[0])
                : null
        };

        return { duplicates, stats };
    };

    const handleResolveDuplicate = (appNo) => {
        // Implement your duplicate resolution logic here
        // console.log(`Resolving duplicate for ${appNo}`);
        // navigate(`/edit-appno/${appNo}`);
    };

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleString();
    };

    return (
        <>
            <NavBar currentPage={"Duplication"} />
            {ADMIN_EMAILS.includes(user.email) ? (
                <div className="min-h-screen flex flex-col items-center bg-slate-100 ">

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" component="h1">
                            Duplicate Application Numbers Report
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {stats && (
                                <Card sx={{ mb: 4 }}>
                                    <CardHeader
                                        title="Duplicate Statistics"
                                        avatar={<WarningIcon color="warning" />}
                                    />
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            <Box>
                                                <Typography variant="subtitle1">Total Entries</Typography>
                                                <Typography variant="h4">{stats.totalEntries}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1">Unique AppNos</Typography>
                                                <Typography variant="h4">{stats.uniqueAppNos}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1">Duplicate AppNos</Typography>
                                                <Typography variant="h4" color="error">
                                                    {stats.duplicateAppNos}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1">Duplicate Entries</Typography>
                                                <Typography variant="h4" color="error">
                                                    {stats.duplicateEntries}
                                                </Typography>
                                            </Box>
                                            {stats.mostDuplicated && (
                                                <Box>
                                                    <Typography variant="subtitle1">Most Duplicated</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="h4">
                                                            {stats.mostDuplicated.appNo}
                                                        </Typography>
                                                        <Chip
                                                            label={`${stats.mostDuplicated.count} times`}
                                                            color="error"
                                                            size="small"
                                                        />
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}

                            {duplicates.length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Application No.</TableCell>
                                                <TableCell align="center">Count</TableCell>
                                                <TableCell>Entries</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {duplicates.map((dup, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Typography fontWeight="bold">{dup.appNo}</Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={dup.count}
                                                            color="error"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                                                            {dup.entries.map((entry, i) => (
                                                                <ListItem key={i} divider>
                                                                    <ListItemText
                                                                        primary={`ID: ${entry.id}`}
                                                                        secondary={
                                                                            <>
                                                                                <span>Name: {entry.Name || 'N/A'}</span>
                                                                                <br />
                                                                                <span>Date: {formatDate(entry.Timestamp)}</span>
                                                                            </>
                                                                        }
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleResolveDuplicate(dup.appNo)}
                                                            startIcon={<CheckCircleIcon />}
                                                        >
                                                            Resolve
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info" sx={{ mt: 3 }}>
                                    No duplicate application numbers found.
                                </Alert>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <Container maxWidth="md" sx={{ mt: 4 }}>
                    <Card>
                        <CardHeader
                            title="Access Denied"
                            avatar={<WarningIcon color="warning" />}
                        />
                        <CardContent>
                            <Typography variant="body1">
                                You do not have permission to view this page.
                            </Typography>
                        </CardContent>
                    </Card>
                </Container>
           )}
        </>
    );
};

export default DuplicateAppNosPage;