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
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  FlightTakeoff,
  Search
} from '@mui/icons-material';

const FlightManagement = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [flightsWithRosters, setFlightsWithRosters] = useState(new Set());
  
  const [formData, setFormData] = useState({
    number: '',
    route: '',
    destination: '',
    origin: 'Istanbul',
    aircraft: 'Boeing 737-800',
    capacity: 189
  });

  useEffect(() => {
    loadFlights();
    checkRosters();
  }, []);

  const checkRosters = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/rosters');
      if (response.ok) {
        const rosters = await response.json();
        const flightNumbers = new Set(rosters.map(roster => roster.flightNumber));
        setFlightsWithRosters(flightNumbers);
      }
    } catch (error) {
      console.warn('Could not check roster status:', error);
    }
  };

  const loadFlights = () => {
    // Load flights from localStorage
    const savedFlights = localStorage.getItem('flights');
    if (savedFlights) {
      setFlights(JSON.parse(savedFlights));
    } else {
      // Default flights
      const defaultFlights = [
        { id: 1, number: 'TK001', route: 'Istanbul → Ankara', destination: 'Ankara', origin: 'Istanbul', aircraft: 'Boeing 737-800', capacity: 189 },
        { id: 2, number: 'TK002', route: 'Istanbul → London', destination: 'London', origin: 'Istanbul', aircraft: 'Airbus A320', capacity: 180 },
        { id: 3, number: 'TK003', route: 'Istanbul → Paris', destination: 'Paris', origin: 'Istanbul', aircraft: 'Boeing 737-800', capacity: 189 },
        { id: 4, number: 'TK004', route: 'Istanbul → Berlin', destination: 'Berlin', origin: 'Istanbul', aircraft: 'Airbus A320', capacity: 180 },
        { id: 5, number: 'TK005', route: 'Istanbul → Rome', destination: 'Rome', origin: 'Istanbul', aircraft: 'Boeing 737-800', capacity: 189 },
        { id: 6, number: 'TK006', route: 'Istanbul → New York', destination: 'New York', origin: 'Istanbul', aircraft: 'Boeing 777-300ER', capacity: 349 },
        { id: 7, number: 'TK007', route: 'Istanbul → Dubai', destination: 'Dubai', origin: 'Istanbul', aircraft: 'Airbus A330', capacity: 290 },
        { id: 8, number: 'TK008', route: 'Istanbul → Tokyo', destination: 'Tokyo', origin: 'Istanbul', aircraft: 'Boeing 777-300ER', capacity: 349 },
        { id: 9, number: 'TK009', route: 'Istanbul → Madrid', destination: 'Madrid', origin: 'Istanbul', aircraft: 'Airbus A320', capacity: 180 },
        { id: 10, number: 'TK010', route: 'Istanbul → Amsterdam', destination: 'Amsterdam', origin: 'Istanbul', aircraft: 'Boeing 737-800', capacity: 189 },
        { id: 11, number: 'TK011', route: 'Istanbul → Frankfurt', destination: 'Frankfurt', origin: 'Istanbul', aircraft: 'Airbus A330', capacity: 290 },
        { id: 12, number: 'TK012', route: 'Istanbul → Moscow', destination: 'Moscow', origin: 'Istanbul', aircraft: 'Airbus A320', capacity: 180 }
      ];
      setFlights(defaultFlights);
      localStorage.setItem('flights', JSON.stringify(defaultFlights));
    }
  };

  const saveFlights = (updatedFlights) => {
    localStorage.setItem('flights', JSON.stringify(updatedFlights));
    setFlights(updatedFlights);
  };

  const handleOpenDialog = (flight = null) => {
    if (flight) {
      setEditingFlight(flight);
      setFormData(flight);
    } else {
      setEditingFlight(null);
      setFormData({
        number: '',
        route: '',
        destination: '',
        origin: 'Istanbul',
        aircraft: 'Boeing 737-800',
        capacity: 189
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFlight(null);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.number || !formData.destination) {
      setError('Flight number and destination are required');
      return;
    }

    const route = `${formData.origin} → ${formData.destination}`;
    const flightData = {
      ...formData,
      route
    };

    try {
      if (editingFlight) {
        // Update existing flight
        const updatedFlights = flights.map(f => 
          f.id === editingFlight.id ? { ...flightData, id: editingFlight.id } : f
        );
        saveFlights(updatedFlights);
        setSuccess('Flight updated successfully!');
      } else {
        // Add new flight
        const newFlight = {
          ...flightData,
          id: Math.max(...flights.map(f => f.id), 0) + 1
        };
        saveFlights([...flights, newFlight]);
        setSuccess('Flight added successfully!');
        
        // Also save to backend
        try {
          await saveFlightToBackend(newFlight);
        } catch (backendError) {
          console.warn('Could not save to backend:', backendError);
          // Continue with localStorage save even if backend fails
        }
      }

      handleCloseDialog();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to save flight');
    }
  };

  const saveFlightToBackend = async (flight) => {
    try {
      // First, get the required entities from backend
      const [sourceAirport, destinationAirport, vehicleType] = await Promise.all([
        fetch('http://localhost:8081/api/airports/code/IST').then(r => r.json()),
        fetch(`http://localhost:8081/api/airports/code/${getAirportCode(flight.destination)}`).then(r => r.json()),
        fetch('http://localhost:8081/api/vehicle-types').then(r => r.json()).then(types => 
          types.find(t => t.typeName === flight.aircraft)
        )
      ]);

      // Map frontend flight data to backend format
      const backendFlight = {
        flightNumber: flight.number,
        flightDate: new Date().toISOString(),
        durationMinutes: 180, // Default duration
        distanceKm: 1000.0, // Default distance
        sourceAirport: sourceAirport,
        destinationAirport: destinationAirport,
        vehicleType: vehicleType,
        isSharedFlight: false
      };

      // Call FlightInfoService API
      const response = await fetch('http://localhost:8081/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendFlight)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save flight to backend: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Backend save error:', error);
      throw error;
    }
  };

  const getAirportCode = (destination) => {
    const airportMap = {
      'Ankara': 'ESB',
      'London': 'LHR',
      'Paris': 'CDG',
      'Berlin': 'TXL',
      'Rome': 'FCO',
      'New York': 'JFK',
      'Dubai': 'DXB',
      'Tokyo': 'NRT',
      'Madrid': 'MAD',
      'Amsterdam': 'AMS',
      'Frankfurt': 'FRA',
      'Moscow': 'SVO'
    };
    return airportMap[destination] || 'IST';
  };

  const handleDelete = async (id) => {
    const flightToDelete = flights.find(f => f.id === id);
    
    // Check if flight has an existing roster
    try {
      const response = await fetch(`http://localhost:8080/api/rosters?flightNumber=${flightToDelete.number}`);
      if (response.ok) {
        const rosters = await response.json();
        const hasRoster = rosters.some(roster => roster.flightNumber === flightToDelete.number);
        
        if (hasRoster) {
          setError(`Cannot delete flight ${flightToDelete.number}. This flight has an existing roster. Please delete the roster first.`);
          setTimeout(() => setError(null), 5000);
          return;
        }
      }
    } catch (error) {
      console.warn('Could not check roster status:', error);
      // Continue with deletion if we can't check
    }
    
    if (window.confirm('Are you sure you want to delete this flight?')) {
      const updatedFlights = flights.filter(f => f.id !== id);
      saveFlights(updatedFlights);
      setSuccess('Flight deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const filteredFlights = flights.filter(flight =>
    searchQuery === '' ||
    flight.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flight.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flight.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const aircraftTypes = [
    { value: 'Boeing 737-800', label: 'Boeing 737-800', capacity: 189 },
    { value: 'Airbus A320', label: 'Airbus A320', capacity: 180 },
    { value: 'Boeing 777-300ER', label: 'Boeing 777-300ER', capacity: 349 },
    { value: 'Airbus A330', label: 'Airbus A330', capacity: 290 },
    { value: 'Boeing 787-9', label: 'Boeing 787-9', capacity: 296 },
    { value: 'Airbus A350', label: 'Airbus A350', capacity: 325 }
  ];

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
            Flight Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Flight
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search flights by number, route, or destination..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
        }}
        sx={{ mb: 3 }}
      />

      {/* Flight Cards */}
      <Grid container spacing={2}>
        {filteredFlights.map((flight) => {
          const hasRoster = flightsWithRosters.has(flight.number);
          return (
            <Grid item xs={12} sm={6} md={4} key={flight.id}>
              <Card sx={{ 
                border: hasRoster ? '2px solid #4caf50' : '1px solid #e0e0e0',
                backgroundColor: hasRoster ? '#f8fff8' : 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">
                          {flight.number}
                        </Typography>
                        {hasRoster && (
                          <Chip 
                            label="Has Roster" 
                            size="small" 
                            color="success"
                          />
                        )}
                      </Box>
                      <Typography color="textSecondary" gutterBottom>
                        {flight.route}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Aircraft: {flight.aircraft}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Capacity: {flight.capacity} passengers
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(flight)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(flight.id)}
                        color="error"
                        disabled={hasRoster}
                        title={hasRoster ? "Cannot delete flight with existing roster" : "Delete flight"}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredFlights.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No flights found matching your search criteria.
        </Alert>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFlight ? 'Edit Flight' : 'Add New Flight'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Flight Number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="e.g., TK013"
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="Origin"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="Destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g., Barcelona"
              sx={{ mb: 2 }}
              required
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Aircraft Type</InputLabel>
              <Select
                value={formData.aircraft}
                label="Aircraft Type"
                onChange={(e) => {
                  const selected = aircraftTypes.find(a => a.value === e.target.value);
                  setFormData({
                    ...formData,
                    aircraft: e.target.value,
                    capacity: selected.capacity
                  });
                }}
              >
                {aircraftTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label} ({type.capacity} seats)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingFlight ? 'Update' : 'Add'} Flight
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlightManagement;


