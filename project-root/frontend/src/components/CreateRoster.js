import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Save, ArrowBack, FlightTakeoff, Search, FilterList } from '@mui/icons-material';
import { rosterAPI } from '../services/api';
import CrewSelection from './CrewSelection';

const CreateRoster = () => {
  const navigate = useNavigate();
  const [flightNumber, setFlightNumber] = useState('');
  const [databaseType, setDatabaseType] = useState('SQL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableFlights, setAvailableFlights] = useState([]);
  const [existingRosters, setExistingRosters] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [showCrewSelection, setShowCrewSelection] = useState(false);
  const [createdRoster, setCreatedRoster] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aircraftFilter, setAircraftFilter] = useState('all');

  useEffect(() => {
    fetchAvailableFlights();
  }, []);

  const fetchAvailableFlights = async () => {
    try {
      setLoadingFlights(true);
      const [rostersResponse] = await Promise.all([
        rosterAPI.getAllRosters()
      ]);
      
      setExistingRosters(rostersResponse.data);
      
      // Load flights from localStorage (managed by FlightManagement component)
      const savedFlights = localStorage.getItem('flights');
      let flights = [];
      
      if (savedFlights) {
        flights = JSON.parse(savedFlights);
      } else {
        // Default flights if none exist
        flights = [
          { id: 1, number: 'TK001', route: 'Istanbul → Ankara', aircraft: 'Boeing 737-800', destination: 'Ankara', origin: 'Istanbul', capacity: 189 },
          { id: 2, number: 'TK002', route: 'Istanbul → London', aircraft: 'Airbus A320', destination: 'London', origin: 'Istanbul', capacity: 180 },
          { id: 3, number: 'TK003', route: 'Istanbul → Paris', aircraft: 'Boeing 737-800', destination: 'Paris', origin: 'Istanbul', capacity: 189 },
          { id: 4, number: 'TK004', route: 'Istanbul → Berlin', aircraft: 'Airbus A320', destination: 'Berlin', origin: 'Istanbul', capacity: 180 },
          { id: 5, number: 'TK005', route: 'Istanbul → Rome', aircraft: 'Boeing 737-800', destination: 'Rome', origin: 'Istanbul', capacity: 189 },
          { id: 6, number: 'TK006', route: 'Istanbul → New York', aircraft: 'Boeing 777-300ER', destination: 'New York', origin: 'Istanbul', capacity: 349 },
          { id: 7, number: 'TK007', route: 'Istanbul → Dubai', aircraft: 'Airbus A330', destination: 'Dubai', origin: 'Istanbul', capacity: 290 },
          { id: 8, number: 'TK008', route: 'Istanbul → Tokyo', aircraft: 'Boeing 777-300ER', destination: 'Tokyo', origin: 'Istanbul', capacity: 349 },
          { id: 9, number: 'TK009', route: 'Istanbul → Madrid', aircraft: 'Airbus A320', destination: 'Madrid', origin: 'Istanbul', capacity: 180 },
          { id: 10, number: 'TK010', route: 'Istanbul → Amsterdam', aircraft: 'Boeing 737-800', destination: 'Amsterdam', origin: 'Istanbul', capacity: 189 },
          { id: 11, number: 'TK011', route: 'Istanbul → Frankfurt', aircraft: 'Airbus A330', destination: 'Frankfurt', origin: 'Istanbul', capacity: 290 },
          { id: 12, number: 'TK012', route: 'Istanbul → Moscow', aircraft: 'Airbus A320', destination: 'Moscow', origin: 'Istanbul', capacity: 180 }
        ];
        localStorage.setItem('flights', JSON.stringify(flights));
      }
      
      setAvailableFlights(flights);
    } catch (err) {
      console.error('Error fetching flights:', err);
    } finally {
      setLoadingFlights(false);
    }
  };

  // Filter flights based on search query and aircraft filter
  const getFilteredFlights = () => {
    return availableFlights.filter(flight => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        flight.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.destination.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Aircraft filter
      const matchesAircraft = aircraftFilter === 'all' || 
        flight.aircraft.includes(aircraftFilter);
      
      return matchesSearch && matchesAircraft;
    });
  };

  const filteredFlights = getFilteredFlights();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!flightNumber) {
      setError('Please select a flight number');
      return;
    }

    // Check if roster already exists
    const existingRoster = existingRosters.find(r => r.flightNumber === flightNumber);
    if (existingRoster) {
      setError(`Roster already exists for flight ${flightNumber}. Please select a different flight.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await rosterAPI.createRoster(flightNumber, databaseType);
      setSuccess(`Roster created successfully for flight ${flightNumber}!`);
      
      // Update existing rosters list to prevent duplicate creation
      setExistingRosters(prev => [...prev, response.data]);
      
      // Mark flight as having rosters in localStorage
      const flights = JSON.parse(localStorage.getItem('flights') || '[]');
      const updatedFlights = flights.map(flight => 
        flight.number === flightNumber 
          ? { ...flight, hasRosters: true }
          : flight
      );
      localStorage.setItem('flights', JSON.stringify(updatedFlights));
      
      // Set created roster and show crew selection
      console.log('Roster created:', response.data);
      setCreatedRoster(response.data);
      setShowCrewSelection(true);
      console.log('showCrewSelection set to true');
      
      // Clear form
      setFlightNumber('');
      setDatabaseType('SQL');
      
      // Don't redirect automatically - let user see crew selection first
      // setTimeout(() => {
      //   navigate(`/rosters/${response.data.id}`);
      // }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create roster. Please check if the flight exists and all services are running.');
      console.error('Error creating roster:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4">
          Create New Flight Roster
        </Typography>
      </Box>

      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Roster Information
              </Typography>
              
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

              <Box component="form" onSubmit={handleSubmit}>
                {/* Search and Filter Section */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Search by flight number, route, or destination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterList />
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Aircraft Type:
                    </Typography>
                    <ToggleButtonGroup
                      value={aircraftFilter}
                      exclusive
                      onChange={(e, newFilter) => newFilter && setAircraftFilter(newFilter)}
                      size="small"
                    >
                      <ToggleButton value="all">All</ToggleButton>
                      <ToggleButton value="Boeing 737">737</ToggleButton>
                      <ToggleButton value="Airbus A320">A320</ToggleButton>
                      <ToggleButton value="Boeing 777">777</ToggleButton>
                      <ToggleButton value="Airbus A330">A330</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    {filteredFlights.length} flight(s) found
                  </Typography>
                </Box>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Flight Number</InputLabel>
                  <Select
                    value={flightNumber}
                    label="Flight Number"
                    onChange={(e) => setFlightNumber(e.target.value)}
                    disabled={loadingFlights}
                  >
                    {filteredFlights.map((flight) => {
                      const existingRoster = existingRosters.find(r => r.flightNumber === flight.number);
                      return (
                        <MenuItem 
                          key={flight.number} 
                          value={flight.number}
                          disabled={!!existingRoster}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <FlightTakeoff sx={{ mr: 1 }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1">
                                {flight.number} - {flight.route}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {flight.aircraft}
                              </Typography>
                            </Box>
                            {existingRoster && (
                              <Chip label="Already exists" size="small" color="warning" />
                            )}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Database Type</InputLabel>
                  <Select
                    value={databaseType}
                    label="Database Type"
                    onChange={(e) => setDatabaseType(e.target.value)}
                  >
                    <MenuItem value="SQL">SQL Database</MenuItem>
                    <MenuItem value="NoSQL">NoSQL Database</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading || !flightNumber}
                    fullWidth
                  >
                    {loading ? 'Creating Roster...' : 'Create Roster'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Available Flights
            </Typography>
            <Typography color="textSecondary">
              Select a flight from the dropdown above. Flights with existing rosters are disabled.
            </Typography>
          </Box>
          {searchQuery || aircraftFilter !== 'all' ? (
            <Button 
              size="small" 
              onClick={() => {
                setSearchQuery('');
                setAircraftFilter('all');
              }}
            >
              Clear Filters
            </Button>
          ) : null}
        </Box>
        
        {loadingFlights ? (
          <Box display="flex" alignItems="center">
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography>Loading available flights...</Typography>
          </Box>
        ) : filteredFlights.length === 0 ? (
          <Alert severity="info">
            No flights found matching your search criteria. Try adjusting your filters.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {filteredFlights.map((flight) => {
              const existingRoster = existingRosters.find(r => r.flightNumber === flight.number);
              return (
                <Grid item xs={12} sm={6} key={flight.number}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6">
                            {flight.number}
                          </Typography>
                          <Typography color="textSecondary">
                            {flight.route}
                          </Typography>
                          <Typography variant="caption">
                            {flight.aircraft}
                          </Typography>
                        </Box>
                        {existingRoster ? (
                          <Chip label="Roster exists" color="warning" size="small" />
                        ) : (
                          <Chip label="Available" color="success" size="small" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Crew Selection Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Debug Info: showCrewSelection={showCrewSelection.toString()}, createdRoster={createdRoster ? 'exists' : 'null'}
        </Typography>
        
        {/* Always show crew selection if we have a created roster */}
        {createdRoster && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Crew Selection
            </Typography>
            <CrewSelection 
              rosterId={createdRoster.id}
              onCrewAssigned={async (updatedRoster) => {
                // Fetch fresh roster data from backend
                try {
                  const response = await rosterAPI.getRosterById(createdRoster.id);
                  setCreatedRoster(response.data);
                  setSuccess('Crew assigned successfully!');
                } catch (error) {
                  console.error('Error fetching updated roster:', error);
                  setCreatedRoster(updatedRoster);
                  setSuccess('Crew assigned successfully!');
                }
              }}
            />
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/rosters/${createdRoster.id}`)}
                sx={{ mr: 2 }}
              >
                View Roster
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setShowCrewSelection(false);
                  setCreatedRoster(null);
                }}
              >
                Create Another Roster
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Show message if no roster created yet */}
        {!createdRoster && (
          <Typography variant="body1" color="textSecondary">
            Create a roster first to see crew selection options.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CreateRoster;
