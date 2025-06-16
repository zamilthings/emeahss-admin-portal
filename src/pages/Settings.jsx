import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Select, MenuItem, Button,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, FormControl, InputLabel, Tabs, Tab, Chip
} from '@mui/material';
import { Download } from 'lucide-react';
import { collection, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import NavBar from '../components/NavBar';
// At the top of StudentRankingPage.js
// In StudentRankingPage.js, modify the table to include WGPA:
import { panchayatOptions, nomineesOptions } from '../const/options';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import { useAuth } from "@/context/AuthContext";
import { Save, CirclePlus, Plus } from 'lucide-react';
import { ADMIN_EMAILS } from "../const/options";
// Course options with weight information
const courseOptions = [
    {
        value: '1 - Physics, Chemistry, Biology,Mathematics',
        label: '1 - Physics, Chemistry, Biology,Mathematics',
        weightedSubjects: ['Physics', 'Chemistry', 'Biology', 'Maths', 'Science']
    },
    {
        value: '11 - History, Economics, Political Science, Sociology',
        label: '11 - History, Economics, Political Science, Sociology',
        weightedSubjects: ['SocialScience']
    },
    {
        value: '35 - Journalism, English Literature, Communicative English, Psychology',
        label: '35 - Journalism, English Literature, Communicative English, Psychology',
        weightedSubjects: ['SocialScience', 'English']
    },
    {
        value: '37 - Business Studies, Accountancy, Economics,Statistics',
        label: '37 - Business Studies, Accountancy, Economics,Statistics',
        weightedSubjects: ['Maths', 'SocialScience']
    },
    {
        value: '39 - Business Studies, Accountancy, Economics,Computer Application',
        label: '39 - Business Studies, Accountancy, Economics,Computer Application',
        weightedSubjects: ['Maths', 'SocialScience']
    }
];

const StudentRankingSystem = () => {
    const [tabValue, setTabValue] = useState(0);
    const [settings, setSettings] = useState({
        panchayathPoints: {},
        nomineePoints: {},
        schoolPoints: { 'EMEA Higher Secondary School': 0 },
        boardPoints: { 'CBSE': 0 },
        ournomineePoint: 0
    });
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState({ settings: true, students: true });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [newPoint, setNewPoint] = useState({ type: '', name: '', value: 0 });
    const [selectedCourse, setSelectedCourse] = useState('');
    const { user } = useAuth();

    // Fetch all data
    useEffect(() => {
        if (!user) return;
        else if (!ADMIN_EMAILS.includes(user.email)) return;
        const fetchData = async () => {
            try {
                // Fetch settings
                const settingsDoc = await getDoc(doc(db, 'settings', 'bonusPoints'));
                if (settingsDoc.exists()) {
                    setSettings(settingsDoc.data());
                } else {
                    await setDoc(doc(db, 'settings', 'bonusPoints'), {
                        panchayathPoints: {},
                        nomineePoints: {},
                        schoolPoints: { 'EMEA HSS': 0 },
                        boardPoints: { 'CBSE': 0 }
                    });
                }

                // Fetch students
                const studentsSnapshot = await getDocs(collection(db, 'applications'));
                const studentsData = [];
                studentsSnapshot.forEach(doc => {
                    studentsData.push({ id: doc.id, ...doc.data() });
                });
                setStudents(studentsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading({ settings: false, students: false });
            }
        };

        fetchData();
    }, []);

    // Filter and sort students when course selection changes
    useEffect(() => {
        const filterAndSortStudents = () => {
            if (!selectedCourse) {
                setFilteredStudents([]);
                return;
            }

            try {
                const results = students
                    .filter(student =>
                        student?.Nominee &&
                        student?.Religion === 'Muslim' &&
                        (student?.coursePreference1 === selectedCourse ||
                            student?.coursePreference2 === selectedCourse)
                    )
                    .map(student => ({
                        ...student,
                        avp: calculateAVP(student),
                        ...calculateWGPA(student, calculateAVP(student), settings)
                    }))
                    .sort((a, b) => parseFloat(b.WGPA) - parseFloat(a.WGPA));

                setFilteredStudents(results);
            } catch (error) {
                console.error('Processing error:', error);
                setFilteredStudents([]);
            }
        };

        filterAndSortStudents();
    }, [selectedCourse, students, settings]);

    // Calculate AVP for a student
    const calculateAVP = (student) => {
        const isCBSE = student.Board === 'CBSE';
        const subjects = [
            'Language1', 'Language2', 'English', 'Hindi',
            'SocialScience', 'Physics', 'Chemistry', 'Biology',
            'Maths', 'IT', 'Science'
        ];

        // Get current course's weighted subjects
        const currentCourse = courseOptions.find(c => c.value === selectedCourse);
        const weightedSubjects = currentCourse?.weightedSubjects || [];

        // Calculate totals
        let TGP = 0;  // Total Grade Points
        let GSW = 0;   // Grade Points of Weighted Subjects
        let validSubjects = 0;
        let validWeightedSubjects = 0; // Count of weighted subjects with marks

        subjects.forEach(subject => {
            const mark = parseFloat(student[subject]) || 0;
            if (mark > 0) {
                TGP += mark;
                validSubjects++;
                if (weightedSubjects.includes(subject)) {
                    GSW += mark;
                    validWeightedSubjects++;
                }
            }
        });

        const TS = isCBSE ? 5 : 10;  // Total Subjects
        const TSW = validWeightedSubjects; // Only count weighted subjects with actual marks

        // console.log(`Calculating AVP for ${student.Name} (${student.AppNo}) - 
        //             TGP: ${TGP}, GSW: ${GSW}, 
        //             TS: ${TS}, TSW: ${validWeightedSubjects},
        //             Subjects with marks: ${validSubjects},
        //             Weighted subjects with marks: ${validWeightedSubjects}`);

        // Calculate AVP - return 0 if no valid subjects to avoid division by zero
        if (TS + TSW === 0) return '0.00';
        const AVP = (TGP + GSW) / (TS + TSW);
        return AVP.toFixed(3);
    };

    // Calculate WGPA with bonus points
    const calculateWGPA = (student, avp) => {
        let BVP = 0;
        // console.log(student.Panchayath, student.Nominee, student.SchoolName, student.Board);
        // Apply all bonus points
        if (settings.panchayathPoints[student.Panchayath]) {
            BVP += settings.panchayathPoints[student.Panchayath];
            // console.log(`Panchayath bonus for ${student.Name} (${student.AppNo}): ${settings.panchayathPoints[student.Panchayath]}`);
        }
        if (settings.nomineePoints[student.Nominee]) {
            BVP += settings.nomineePoints[student.Nominee];
            // console.log(`Nominee bonus for ${student.Name} (${student.AppNo}): ${settings.nomineePoints[student.Nominee]}`);
        }
        if (student.SchoolName === 'EMEA Higher Secondary School' && settings.schoolPoints['EMEA Higher Secondary School']) {
            BVP += settings.schoolPoints['EMEA Higher Secondary School'];
            // console.log(`School bonus for ${student.Name} (${student.AppNo}): ${settings.schoolPoints['EMEA Higher Secondary School']}`);
        }
        if (student.Board === 'CBSE' && settings.boardPoints['CBSE']) {
            BVP += settings.boardPoints['CBSE'];
            // console.log(`Board bonus for ${student.Name} (${student.AppNo}): ${settings.boardPoints['CBSE']}`);
        }

        // NEW: Add our nominee point if student's nominee is in our list
        if (nomineesOptions.includes(student.Nominee) && settings.ournomineePoint) {
            BVP += settings.ournomineePoint;
        }

        // if (BVP > 0) {
        //     BVP /= 10;
        // }
        // console.log(`Calculating BVP for ${student.Name} (${student.AppNo}) - ${BVP} `)
        const WGPA = (parseFloat(avp) + (BVP)).toFixed(3);
        return { WGPA, BVP: BVP.toFixed(2) };
    };
    // Export to CSV
    const exportToCSV = () => {
        const fields = [
            "AppNo", "Name", "MobileNumber", "WhatsappNumber", "DateOfBirth",
            "RegNumber", "Year", "Board", "Gender", "Religion", "FatherName",
            "MotherName", "SchoolName", "SingleWindowNo", "Panchayath", "Ward",
            "PostOffice", "HouseName", "Nominee", "coursePreference1",
            "coursePreference2", "Language1", "Language2", "English", "Hindi",
            "SocialScience", "Physics", "Chemistry", "Biology", "Maths", "IT",
            "Science", "TotalMark", "Payment", 'AVP', 'BVP', 'WGPA',
        ];

        const csvRows = [fields.join(',')];

        filteredStudents.forEach(student => {
            const row = fields.map(field => {
                if (field === 'AVP') {
                    return calculateAVP(student);
                }
                if (field === 'BVP' || field === 'WGPA') {
                    const avp = calculateAVP(student);
                    const { BVP, WGPA } = calculateWGPA(student, avp);
                    return field === 'BVP' ? BVP : WGPA;
                }
                return `"${student[field] || ''}"`;
            });
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `students_${selectedCourse.replace(/ /g, '_')}Rank_list.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        message: '',
        severity: 'success' // 'success' | 'error'
    });

    const saveSettings = async () => {
        setSubmitLoading(true);
        try {
            await setDoc(doc(db, 'settings', 'bonusPoints'), settings);
            setDialog({
                open: true,
                title: 'Success',
                message: 'Settings saved successfully!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            setDialog({
                open: true,
                title: 'Error',
                message: 'Failed to save settings',
                severity: 'error'
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <>
            <NavBar currentPage="Ranking System" />
            {ADMIN_EMAILS.includes(user.email) ? (
                <Box sx={{ p: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Student Ranking" />
                        <Tab label="Bonus Points Settings" />
                    </Tabs>

                    {tabValue === 0 && (
                        <Box sx={{ mt: 3 }}>
                            {/* Course Selection UI */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Select Course</InputLabel>
                                    <Select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        label="Select Course"
                                    >
                                        <MenuItem value="" disabled>
                                            <Typography color="text.secondary">Select a course</Typography>
                                        </MenuItem>
                                        {courseOptions.map((course) => (
                                            <MenuItem key={course.value} value={course.value}>
                                                {course.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    startIcon={<Download />}
                                    onClick={exportToCSV}
                                    disabled={!selectedCourse || filteredStudents.length === 0}
                                >
                                    Export CSV
                                </Button>
                            </Box>

                            {/* Student Table State Handling */}
                            {loading.students ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : !selectedCourse ? (
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: 4,
                                    gap: 2
                                }}>
                                    <InfoOutlined color="disabled" sx={{ fontSize: 60 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        Please select a course to view students
                                    </Typography>
                                </Box>
                            ) : filteredStudents.length === 0 ? (
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: 4,
                                    gap: 2
                                }}>
                                    <SearchOffOutlined color="disabled" sx={{ fontSize: 60 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        No students found for the selected course
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Try selecting a different course or check your filters
                                    </Typography>
                                </Box>
                            ) : (
                                <StudentTable
                                    students={filteredStudents}
                                    settings={settings}
                                />
                            )}
                        </Box>
                    )}

                    {tabValue === 1 && (
                        <Box sx={{ mt: 3, position: 'relative' }}>
                            {/* Bonus Points Settings UI */}
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h4" gutterBottom>
                                    Bonus Points Configuration
                                </Typography>

                                {/* 1. Panchayath Points */}
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Panchayath Points
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                        <FormControl sx={{ minWidth: 200 }}>
                                            <InputLabel>Select Panchayath</InputLabel>
                                            <Select
                                                value=""
                                                onChange={(e) => {
                                                    const panchayath = e.target.value;
                                                    if (panchayath && !settings.panchayathPoints[panchayath]) {
                                                        setSettings(prev => ({
                                                            ...prev,
                                                            panchayathPoints: {
                                                                ...prev.panchayathPoints,
                                                                [panchayath]: 0
                                                            }
                                                        }));
                                                    }
                                                }}
                                                label="Select Panchayath"
                                            >
                                                {panchayatOptions.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {/* <Button
                                        variant="outlined"
                                        startIcon={<Plus />}
                                        onClick={() => {
                                            const newPanchayath = prompt("Enter new Panchayath name:");
                                            if (newPanchayath) {
                                                setSettings(prev => ({
                                                    ...prev,
                                                    panchayathPoints: {
                                                        ...prev.panchayathPoints,
                                                        [newPanchayath]: 0
                                                    }
                                                }));
                                            }
                                        }}
                                    >
                                        Add Custom
                                    </Button> */}
                                    </Box>
                                    <PointTable
                                        points={settings.panchayathPoints}
                                        onChange={(name, value) => setSettings(prev => ({
                                            ...prev,
                                            panchayathPoints: { ...prev.panchayathPoints, [name]: value }
                                        }))}
                                        onRemove={(name) => {
                                            const newPoints = { ...settings.panchayathPoints };
                                            delete newPoints[name];
                                            setSettings(prev => ({
                                                ...prev,
                                                panchayathPoints: newPoints
                                            }));
                                        }}
                                    />
                                </Box>

                                {/* 2. Nominee Points */}
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Nominee Points
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                        <FormControl sx={{ minWidth: 200 }}>
                                            <InputLabel>Select Nominee</InputLabel>
                                            <Select
                                                value=""
                                                onChange={(e) => {
                                                    const nominee = e.target.value;
                                                    if (nominee && !settings.nomineePoints[nominee]) {
                                                        setSettings(prev => ({
                                                            ...prev,
                                                            nomineePoints: {
                                                                ...prev.nomineePoints,
                                                                [nominee]: 0
                                                            }
                                                        }));
                                                    }
                                                }}
                                                label="Select Nominee"
                                            >
                                                {nomineesOptions.map(nominee => (
                                                    <MenuItem key={nominee} value={nominee}>
                                                        {nominee}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {/* <Button
                                        variant="outlined"
                                        startIcon={<Plus />}
                                        onClick={() => {
                                            const newNominee = prompt("Enter new Nominee name:");
                                            if (newNominee) {
                                                setSettings(prev => ({
                                                    ...prev,
                                                    nomineePoints: {
                                                        ...prev.nomineePoints,
                                                        [newNominee]: 0
                                                    }
                                                }));
                                            }
                                        }}
                                    >
                                        Add Custom
                                    </Button> */}
                                    </Box>
                                    <PointTable
                                        points={settings.nomineePoints}
                                        onChange={(name, value) => setSettings(prev => ({
                                            ...prev,
                                            nomineePoints: { ...prev.nomineePoints, [name]: value }
                                        }))}
                                        onRemove={(name) => {
                                            const newPoints = { ...settings.nomineePoints };
                                            delete newPoints[name];
                                            setSettings(prev => ({
                                                ...prev,
                                                nomineePoints: newPoints
                                            }));
                                        }}
                                    />
                                </Box>

                                {/* 3. School Points (EMEA HSS only) */}
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        School Points (EMEA HSS only)
                                    </Typography>
                                    <TextField
                                        label="Bonus Points"
                                        type="number"
                                        fullWidth
                                        style={{ width: '200px' }}
                                        value={settings.schoolPoints['EMEA Higher Secondary School'] || 0}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            schoolPoints: { 'EMEA Higher Secondary School': parseFloat(e.target.value) || 0 }
                                        }))}
                                        inputProps={{ step: "0.1", min: "0", max: "5" }}
                                    />
                                </Box>

                                {/* 4. Board Points (CBSE only) */}
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Board Points (CBSE only)
                                    </Typography>
                                    <TextField
                                        label="Bonus Points"
                                        type="number"
                                        style={{ width: '200px' }}
                                        value={settings.boardPoints['CBSE'] || 0}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            boardPoints: { 'CBSE': parseFloat(e.target.value) || 0 }
                                        }))}
                                        inputProps={{ step: "0.1", min: "0", max: "5" }}
                                    />
                                </Box>
                                {/* 5. Bonus Point for our nominees*/}
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Our Nominee Bonus Point
                                    </Typography>
                                    <TextField
                                        label="Bonus Point for our nominees"
                                        type="number"
                                        style={{ width: '200px' }}
                                        value={settings.ournomineePoint || 0}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            ournomineePoint: parseFloat(e.target.value) || 0
                                        }))}
                                        inputProps={{ step: "0.1", min: "0", max: "5" }}
                                        helperText="Applies to all students with nominees from our list"
                                    />
                                </Box>
                                {/* Loading overlay */}
                                {submitLoading && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 1000
                                    }}>
                                        <CircularProgress />
                                    </Box>
                                )}
                                <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    onClick={saveSettings}
                                    sx={{ mt: 2 }}
                                >
                                    Save All Settings
                                </Button>
                            </Box>
                            <Dialog open={dialog.open} onClose={() => setDialog(prev => ({ ...prev, open: false }))}>
                                <DialogTitle sx={{
                                    color: dialog.severity === 'success' ? 'success.main' : 'error.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    {dialog.severity === 'success' ? (
                                        <CheckCircle color="success" />
                                    ) : (
                                        <Error color="error" />
                                    )}
                                    {dialog.title}
                                </DialogTitle>
                                <DialogContent>
                                    <Typography>{dialog.message}</Typography>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={() => setDialog(prev => ({ ...prev, open: false }))}
                                        color={dialog.severity === 'success' ? 'success' : 'error'}
                                    >
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Box>
                    )}
                </Box>
            ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="error">
                        Access Denied
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        You do not have permission to access this page.
                    </Typography>
                </Box>
            )}
        </>
    );
};

// Sub-components
const StudentTable = ({ students, settings }) => {
    if (students.length === 0) return <Typography>No students found</Typography>;
    return (
        <div className='flex flex-col gap-4'>
            {/* Bonus Points Header with Explanations */}
            <Box sx={{
                mb: 2,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                borderLeft: '4px solid #3f51b5'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Bonus Points Calculation
                </Typography>

                {/* Check if any bonus points exist */}
                {(() => {
                    const hasBoardPoints = Object.values(settings.boardPoints).some(points => points !== 0);
                    const hasSchoolPoints = Object.values(settings.schoolPoints).some(points => points !== 0);
                    const hasNomineePoints = Object.values(settings.nomineePoints).some(points => points !== 0);
                    const hasPanchayathPoints = Object.values(settings.panchayathPoints).some(points => points !== 0);
                    const hasOurNomineePoint = settings.ournomineePoint !== 0;

                    const hasAnyPoints = hasBoardPoints || hasSchoolPoints || hasNomineePoints || hasPanchayathPoints || hasOurNomineePoint;

                    return hasAnyPoints ? (
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {/* Dynamic Board Points */}
                            {Object.entries(settings.boardPoints).map(([board, points]) => (
                                points !== 0 && (
                                    <Chip
                                        key={`board-${board}`}
                                        label={`${board}: ${points} points`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ color: 'primary.main' }}
                                    />
                                )
                            ))}

                            {/* Dynamic School Points */}
                            {Object.entries(settings.schoolPoints).map(([school, points]) => (
                                points !== 0 && (
                                    <Chip
                                        key={`school-${school}`}
                                        label={`${school}: ${points} points`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ color: 'secondary.main' }}
                                    />
                                )
                            ))}

                            {/* Dynamic Nominee Points */}
                            {Object.entries(settings.nomineePoints).map(([nominee, points]) => (
                                points !== 0 && (
                                    <Chip
                                        key={`nominee-${nominee}`}
                                        label={`${nominee}: ${points} points`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ color: 'success.main' }}
                                    />
                                )
                            ))}

                            {/* Dynamic Panchayath Points */}
                            {Object.entries(settings.panchayathPoints).map(([panchayath, points]) => (
                                points !== 0 && (
                                    <Chip
                                        key={`panchayath-${panchayath}`}
                                        label={`${panchayath}: ${points} points`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ color: 'warning.main' }}
                                    />
                                )
                            ))}

                            {/* Our Nominee Point */}
                            {hasOurNomineePoint && (
                                <Chip
                                    label={`Our Nominees: ${settings.ournomineePoint} points`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: 'info.main' }}
                                />
                            )}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No bonus points configured
                        </Typography>
                    );
                })()}
            </Box>

            <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mb: 1,
                p: 1,
                backgroundColor: '#f8f9fa',
                borderRadius: 1
            }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Total Applications: {students?.length}
                </Typography>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>App No</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>School</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Board</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Panchayath</TableCell>
                            {/* <TableCell>Course 1</TableCell> */}
                            <TableCell sx={{ fontWeight: 'bold' }}>Nominee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>AVP</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>BVP</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>WGPA</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => {
                            return (
                                <TableRow key={student.id}>
                                    <TableCell>{student.AppNo}</TableCell>
                                    <TableCell>{student.Name}</TableCell>
                                    <TableCell>{student.SchoolName}</TableCell>
                                    <TableCell>{student.Board}</TableCell>
                                    <TableCell>{student.Panchayath}</TableCell>
                                    {/* <TableCell>{student.coursePreference1}</TableCell> */}
                                    <TableCell>{student.Nominee}</TableCell>
                                    <TableCell>{student.avp}</TableCell>
                                    <TableCell>{student.BVP}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{student.WGPA}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

const PointTable = ({ points, onChange, onRemove }) => {
    const pointEntries = Object.entries(points);

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Points</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pointEntries.map(([name, value]) => (
                        <TableRow key={name}>
                            <TableCell>{name}</TableCell>
                            <TableCell>
                                <TextField
                                    type="number"
                                    value={value}
                                    onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
                                    inputProps={{
                                        step: "0.1",
                                        min: "0",
                                        max: "5",
                                        style: { width: '80px' }
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => onRemove(name)}
                                >
                                    Remove
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};



export default StudentRankingSystem;