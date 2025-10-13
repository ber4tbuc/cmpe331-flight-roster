import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Flight,
  People,
  Search,
  Refresh,
  Edit,
  Delete,
  Add
} from '@mui/icons-material';
import { crewAPI, pilotServiceAPI, cabinServiceAPI } from '../services/api';

const CrewManagement = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [pilots, setPilots] = useState([]);
  const [cabinCrew, setCabinCrew] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    licenseNumber: '',
    rank: 'CAPTAIN',
    position: 'LEAD',
    experience: 0,
    nationality: 'Turkish'
  });

  useEffect(() => {
    loadCrewMembers();
  }, []);

  const loadCrewMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch pilots from backend
      const pilotsResponse = await crewAPI.getAvailablePilots();
      const pilotsData = pilotsResponse.data.map(pilot => {
        // Split name if it contains surname (e.g., "John Doe")
        const nameParts = (pilot.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        return {
          id: pilot.id || pilot.pilotId,
          name: firstName,
          surname: lastName,
          licenseNumber: pilot.pilotId || 'N/A',
          rank: pilot.seniorityLevel || 'N/A',
          experience: pilot.maxDistanceKm || 0, // Using max distance as experience proxy
          nationality: pilot.nationality || 'Unknown'
        };
      });
      setPilots(pilotsData);
      
      // Fetch cabin crew from backend
      const cabinCrewResponse = await crewAPI.getAvailableCabinCrew();
      const cabinCrewData = cabinCrewResponse.data.map(crew => {
        // Split name if it contains surname (e.g., "John Doe")
        const nameParts = (crew.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        return {
          id: crew.id || crew.attendantId,
          name: firstName,
          surname: lastName,
          licenseNumber: crew.attendantId || 'N/A',
          position: crew.attendantType || 'N/A',
          experience: crew.age || 0, // Using age as experience proxy
          nationality: crew.nationality || 'Unknown'
        };
      });
      setCabinCrew(cabinCrewData);
      
    } catch (err) {
      console.error('Error fetching crew members:', err);
      setError('Failed to load crew members from backend. Please check if all services are running.');
      
      // Fallback to empty arrays
      setPilots([]);
      setCabinCrew([]);
    } finally {
      setLoading(false);
    }
  };


  const handleOpenDialog = (member = null, isPilot = true) => {
    if (member) {
      // Edit mode
      setEditingMember({ ...member, isPilot });
      setFormData({
        name: member.name || '',
        surname: member.surname || '',
        licenseNumber: member.licenseNumber || '',
        rank: member.rank || 'SENIOR',
        position: member.position || 'REGULAR',
        experience: member.experience || 0,
        nationality: member.nationality || '',
        age: member.experience || 25,
        gender: 'Male',
        vehicleRestriction: 'Boeing 737-800',
        attendantType: member.position || 'REGULAR'
      });
    } else {
      // Add mode
      setEditingMember({ isPilot });
      setFormData({
        name: '',
        surname: '',
        licenseNumber: '',
        rank: 'SENIOR',
        position: 'REGULAR',
        experience: 0,
        nationality: 'Turkish',
        age: 25,
        gender: 'Male',
        vehicleRestriction: 'Boeing 737-800',
        attendantType: 'REGULAR'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMember(null);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.surname) {
      setError('Name and surname are required');
      return;
    }

    const isPilot = editingMember?.isPilot ?? tabValue === 0;
    const fullName = `${formData.name} ${formData.surname}`.trim();

    try {
      if (editingMember && editingMember.id) {
        // Update existing member
        if (isPilot) {
          const pilotData = {
            pilotId: formData.licenseNumber,
            name: fullName,
            age: formData.age || 30,
            gender: formData.gender || 'Male',
            nationality: formData.nationality,
            knownLanguages: '["Turkish", "English"]',
            vehicleRestriction: formData.vehicleRestriction || 'Boeing 737-800',
            maxDistanceKm: formData.experience || 5000,
            seniorityLevel: formData.rank,
            isAvailable: true
          };
          await pilotServiceAPI.updatePilot(editingMember.id, pilotData);
        } else {
          const attendantData = {
            attendantId: formData.licenseNumber,
            name: fullName,
            age: formData.age || 25,
            gender: formData.gender || 'Female',
            nationality: formData.nationality,
            knownLanguages: '["Turkish", "English"]',
            attendantType: formData.attendantType || formData.position,
            vehicleRestrictions: '["Boeing 737-800", "Airbus A320"]',
            isAvailable: true
          };
          await cabinServiceAPI.updateAttendant(editingMember.id, attendantData);
        }
        setSuccess('Crew member updated successfully!');
      } else {
        // Add new member
        if (isPilot) {
          const pilotData = {
            pilotId: formData.licenseNumber || `P${Date.now()}`,
            name: fullName,
            age: formData.age || 30,
            gender: formData.gender || 'Male',
            nationality: formData.nationality,
            knownLanguages: '["Turkish", "English"]',
            vehicleRestriction: formData.vehicleRestriction || 'Boeing 737-800',
            maxDistanceKm: formData.experience || 5000,
            seniorityLevel: formData.rank,
            isAvailable: true
          };
          await pilotServiceAPI.createPilot(pilotData);
        } else {
          const attendantData = {
            attendantId: formData.licenseNumber || `A${Date.now()}`,
            name: fullName,
            age: formData.age || 25,
            gender: formData.gender || 'Female',
            nationality: formData.nationality,
            knownLanguages: '["Turkish", "English"]',
            attendantType: formData.attendantType || formData.position,
            vehicleRestrictions: '["Boeing 737-800", "Airbus A320"]',
            isAvailable: true
          };
          await cabinServiceAPI.createAttendant(attendantData);
        }
        setSuccess('Crew member added successfully!');
      }

      // Refresh data
      await loadCrewMembers();
      handleCloseDialog();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving crew member:', err);
      setError(err.response?.data?.message || 'Failed to save crew member');
    }
  };

  const handleDelete = async (id, isPilot) => {
    if (window.confirm('Are you sure you want to delete this crew member?')) {
      try {
        if (isPilot) {
          await pilotServiceAPI.deletePilot(id);
        } else {
          await cabinServiceAPI.deleteAttendant(id);
        }
        setSuccess('Crew member deleted successfully!');
        await loadCrewMembers();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting crew member:', err);
        setError('Failed to delete crew member');
      }
    }
  };

  const filterMembers = (members) => {
    return members.filter(member =>
      searchQuery === '' ||
      (member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.surname && member.surname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.licenseNumber && member.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredPilots = filterMembers(pilots);
  const filteredCabinCrew = filterMembers(cabinCrew);

  const renderCrewCard = (member, isPilot) => {
    // Safety check for undefined values
    const initials = `${(member.name || '?')[0]}${(member.surname || '?')[0]}`.toUpperCase();
    
    return (
      <Grid item xs={12} sm={6} md={4} key={member.id}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: isPilot ? 'primary.main' : 'secondary.main' }}>
                  {initials}
                </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">
                  {member.name || 'N/A'} {member.surname || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {member.licenseNumber || 'N/A'}
                </Typography>
                <Chip
                  label={isPilot ? (member.rank || 'N/A') : (member.position || 'N/A')}
                  size="small"
                  color={isPilot ? 'primary' : 'secondary'}
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {isPilot ? `Max Distance: ${member.experience || 0} km` : `Age: ${member.experience || 0}`}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {member.nationality || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(member, isPilot)}
                color="primary"
                title="Edit"
              >
                <Edit />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(member.id, isPilot)}
                color="error"
                title="Delete"
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">
            Crew Management
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog(null, tabValue === 0)}
            sx={{ mr: 1 }}
          >
            Add {tabValue === 0 ? 'Pilot' : 'Cabin Crew'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadCrewMembers}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Success/Error Messages */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<Flight />} label={`Pilots (${pilots.length})`} />
        <Tab icon={<People />} label={`Cabin Crew (${cabinCrew.length})`} />
      </Tabs>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by name, surname, or license number..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
        }}
        sx={{ mb: 3 }}
      />

      {/* Crew Cards */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabValue === 0 ? (
            <Grid container spacing={2}>
              {filteredPilots.map(pilot => renderCrewCard(pilot, true))}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {filteredCabinCrew.map(crew => renderCrewCard(crew, false))}
            </Grid>
          )}

          {((tabValue === 0 && filteredPilots.length === 0) || (tabValue === 1 && filteredCabinCrew.length === 0)) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No crew members found matching your search criteria.
            </Alert>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMember?.id ? 'Edit' : 'Add'} {editingMember?.isPilot ? 'Pilot' : 'Cabin Crew'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
              fullWidth
              label="First Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Last Name"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="License ID"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder={editingMember?.isPilot ? "e.g., P001" : "e.g., A001"}
              sx={{ mb: 2 }}
              helperText="Leave empty to auto-generate"
            />

            {editingMember?.isPilot ? (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Seniority Level</InputLabel>
                  <Select
                    value={formData.rank}
                    label="Seniority Level"
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  >
                    <MenuItem value="SENIOR">Senior</MenuItem>
                    <MenuItem value="JUNIOR">Junior</MenuItem>
                    <MenuItem value="TRAINEE">Trainee</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Max Distance (km)"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={formData.vehicleRestriction}
                    label="Vehicle Type"
                    onChange={(e) => setFormData({ ...formData, vehicleRestriction: e.target.value })}
                  >
                    <MenuItem value="Boeing 737-800">Boeing 737-800</MenuItem>
                    <MenuItem value="Airbus A320">Airbus A320</MenuItem>
                    <MenuItem value="Boeing 777-300ER">Boeing 777-300ER</MenuItem>
                    <MenuItem value="Airbus A330">Airbus A330</MenuItem>
                  </Select>
                </FormControl>
              </>
            ) : (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Position</InputLabel>
                <Select
                  value={formData.position}
                  label="Position"
                  onChange={(e) => setFormData({ ...formData, position: e.target.value, attendantType: e.target.value })}
                >
                  <MenuItem value="CHIEF">Chief</MenuItem>
                  <MenuItem value="REGULAR">Regular</MenuItem>
                  <MenuItem value="CHEF">Chef</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value), experience: parseInt(e.target.value) })}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                label="Gender"
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingMember?.id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CrewManagement;

