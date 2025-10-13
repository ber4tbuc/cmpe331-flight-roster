import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { PersonAdd, FlightTakeoff, Group } from '@mui/icons-material';
import { crewAPI } from '../services/api';

const CrewSelection = ({ rosterId, onCrewAssigned, initialCrew = null }) => {
  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'USER';
  const [pilots, setPilots] = useState([]);
  const [cabinCrew, setCabinCrew] = useState([]);
  const [selectedPilots, setSelectedPilots] = useState([]);
  const [selectedCabinCrew, setSelectedCabinCrew] = useState([]);
  const [isManualMode, setIsManualMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCrewData();
    if (initialCrew) {
      setSelectedPilots(initialCrew.pilots || []);
      setSelectedCabinCrew(initialCrew.cabinCrew || []);
      setIsManualMode(initialCrew.assignmentType === 'MANUAL');
    }
  }, [rosterId, initialCrew]);

  const fetchCrewData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pilotsResponse, cabinCrewResponse] = await Promise.all([
        crewAPI.getAvailablePilots(),
        crewAPI.getAvailableCabinCrew()
      ]);
      
      console.log('Pilots response:', pilotsResponse.data);
      console.log('Cabin crew response:', cabinCrewResponse.data);
      console.log('Pilots count:', pilotsResponse.data?.length);
      console.log('Cabin crew count:', cabinCrewResponse.data?.length);
      
      setPilots(pilotsResponse.data || []);
      setCabinCrew(cabinCrewResponse.data || []);
    } catch (err) {
      setError('Failed to fetch crew data: ' + (err.response?.data || err.message));
      console.error('Error fetching crew data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePilotChange = (event) => {
    setSelectedPilots(event.target.value);
  };

  const handleCabinCrewChange = (event) => {
    setSelectedCabinCrew(event.target.value);
  };

  const handleModeChange = (event) => {
    setIsManualMode(event.target.checked);
    if (!event.target.checked) {
      // Reset selections when switching to automatic
      setSelectedPilots([]);
      setSelectedCabinCrew([]);
    }
  };

  const handleAssignCrew = async () => {
    if (!rosterId) {
      setError('No roster ID provided');
      return;
    }

    // Validation
    if (selectedPilots.length > 2) {
      setError('Maximum 2 pilots can be selected');
      return;
    }

    if (selectedCabinCrew.length > 6) {
      setError('Maximum 6 cabin crew can be selected');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const crewData = {
        pilotIds: selectedPilots.map(pilot => pilot.id),
        cabinCrewIds: selectedCabinCrew.map(crew => crew.id),
        assignmentType: isManualMode ? 'MANUAL' : 'AUTOMATIC'
      };

      console.log('Selected pilots:', selectedPilots);
      console.log('Selected cabin crew:', selectedCabinCrew);
      console.log('Crew data to send:', crewData);

      const response = await crewAPI.assignCrewManually(rosterId, crewData);
      console.log('Assignment response:', response.data);
      setSuccess('Crew assigned successfully!');
      
      if (onCrewAssigned) {
        onCrewAssigned(response.data);
      }
    } catch (err) {
      setError('Failed to assign crew: ' + (err.response?.data || err.message));
      console.error('Error assigning crew:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPilotDisplayName = (pilot) => {
    return `${pilot.name || pilot.firstName + ' ' + pilot.lastName} (${pilot.seniorityLevel || 'N/A'})`;
  };

  const getCabinCrewDisplayName = (crew) => {
    return `${crew.name || crew.firstName + ' ' + crew.lastName} (${crew.attendantType || 'N/A'})`;
  };

  // Only MANAGER and ADMIN can access crew selection
  if (userRole === 'USER') {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        You don't have permission to access crew selection. Only MANAGER and ADMIN roles can assign crew.
      </Alert>
    );
  }

  if (loading && pilots.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading crew data...</Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <Group sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            Crew Selection
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={isManualMode}
              onChange={handleModeChange}
              color="primary"
            />
          }
          label="Manual Crew Selection"
          sx={{ mb: 3 }}
        />

        {isManualMode ? (
          <Grid container spacing={3}>
            {/* Pilot Selection */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <FlightTakeoff sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Pilots</Typography>
                  </Box>
                  
                  <FormControl fullWidth>
                    <InputLabel>Select Pilots (Max 2)</InputLabel>
                    <Select
                      multiple
                      value={selectedPilots}
                      onChange={handlePilotChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((pilot) => (
                            <Chip 
                              key={pilot.id} 
                              label={getPilotDisplayName(pilot)} 
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {pilots.map((pilot) => (
                        <MenuItem 
                          key={pilot.id} 
                          value={pilot}
                          disabled={selectedPilots.length >= 2 && !selectedPilots.some(p => p.id === pilot.id)}
                        >
                          {getPilotDisplayName(pilot)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            {/* Cabin Crew Selection */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonAdd sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="h6">Cabin Crew</Typography>
                  </Box>
                  
                  <FormControl fullWidth>
                    <InputLabel>Select Cabin Crew (Max 6)</InputLabel>
                    <Select
                      multiple
                      value={selectedCabinCrew}
                      onChange={handleCabinCrewChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((crew) => (
                            <Chip 
                              key={crew.id} 
                              label={getCabinCrewDisplayName(crew)} 
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {cabinCrew.map((crew) => (
                        <MenuItem 
                          key={crew.id} 
                          value={crew}
                          disabled={selectedCabinCrew.length >= 6 && !selectedCabinCrew.some(c => c.id === crew.id)}
                        >
                          {getCabinCrewDisplayName(crew)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="textSecondary">
              Automatic crew assignment will be used when creating the roster.
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            {isManualMode 
              ? `Selected: ${selectedPilots.length} pilots, ${selectedCabinCrew.length} cabin crew`
              : 'Automatic assignment enabled'
            }
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleAssignCrew}
            disabled={loading || (!isManualMode && !rosterId) || selectedPilots.length > 2 || selectedCabinCrew.length > 6}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
          >
            {loading ? 'Assigning...' : 'Assign Crew'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CrewSelection;
