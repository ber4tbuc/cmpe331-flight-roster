package com.flightroster.main.service;

import com.flightroster.main.client.*;
import com.flightroster.main.dto.CrewAssignmentRequest;
import com.flightroster.main.entity.FlightRoster;
import com.flightroster.main.entity.RosterPerson;
import com.flightroster.main.repository.FlightRosterRepository;
import com.flightroster.main.repository.RosterPersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FlightRosterService {

    @Autowired
    private FlightRosterRepository flightRosterRepository;

    @Autowired
    private RosterPersonRepository rosterPersonRepository;

    @Autowired
    private FlightInfoClient flightInfoClient;

    @Autowired
    private PilotClient pilotClient;

    @Autowired
    private CabinClient cabinClient;

    @Autowired
    private PassengerClient passengerClient;

    @Autowired
    private SeatAssignmentService seatAssignmentService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<FlightRoster> getAllRosters() {
        return flightRosterRepository.findByIsActiveTrue();
    }

    public FlightRoster getRosterById(Long id) {
        return flightRosterRepository.findById(id).orElse(null);
    }

    public FlightRoster getRosterByFlightNumber(String flightNumber) {
        return flightRosterRepository.findByFlightNumber(flightNumber).orElse(null);
    }

    public FlightRoster createRoster(String flightNumber, String databaseType) {
        try {
            // Get flight information
            Map<String, Object> flight = flightInfoClient.getFlightByNumber(flightNumber);
            if (flight == null) {
                throw new RuntimeException("Flight not found: " + flightNumber);
            }

            // Get vehicle type to determine crew requirements
            Map<String, Object> vehicleType = (Map<String, Object>) flight.get("vehicleType");
            String vehicleTypeName = (String) vehicleType.get("typeName");

            // Get pilots (limit to 2)
            List<Map<String, Object>> pilots = pilotClient.getPilotsByVehicleType(vehicleTypeName);
            if (pilots.size() > 2) {
                pilots = pilots.subList(0, 2); // Limit to 2 pilots
            }
            List<Map<String, Object>> seniorPilots = pilotClient.getPilotsBySeniorityLevel("SENIOR");
            List<Map<String, Object>> juniorPilots = pilotClient.getPilotsBySeniorityLevel("JUNIOR");

            // Get cabin crew (limit to 6 total)
            List<Map<String, Object>> chiefs = cabinClient.getAvailableChiefs();
            List<Map<String, Object>> regulars = cabinClient.getAvailableRegulars();
            List<Map<String, Object>> chefs = cabinClient.getAvailableChefs();
            
            // Limit total cabin crew to 6
            List<Map<String, Object>> allCabinCrew = new ArrayList<>();
            allCabinCrew.addAll(chiefs);
            allCabinCrew.addAll(regulars);
            allCabinCrew.addAll(chefs);
            
            if (allCabinCrew.size() > 6) {
                allCabinCrew = allCabinCrew.subList(0, 6);
                // Redistribute among types
                chiefs = allCabinCrew.stream().filter(c -> "CHIEF".equals(c.get("attendantType"))).collect(Collectors.toList());
                regulars = allCabinCrew.stream().filter(c -> "REGULAR".equals(c.get("attendantType"))).collect(Collectors.toList());
                chefs = allCabinCrew.stream().filter(c -> "CHEF".equals(c.get("attendantType"))).collect(Collectors.toList());
            }

            // Get passengers
            List<?> passengersRaw = passengerClient.getPassengersByFlightId(flightNumber);
            List<Map<String, Object>> passengers = new ArrayList<>();
            if (passengersRaw != null) {
                for (Object passenger : passengersRaw) {
                    if (passenger instanceof Map) {
                        passengers.add((Map<String, Object>) passenger);
                    }
                }
            }

            // Create roster
            FlightRoster roster = new FlightRoster();
            roster.setFlightNumber(flightNumber);
            roster.setRosterName("Roster for " + flightNumber + " - " + LocalDateTime.now().toString());
            roster.setCreatedDate(LocalDateTime.now());
            roster.setDatabaseType(databaseType);
            roster.setIsActive(true);

            // Assign seats to passengers automatically
            List<Map<String, Object>> passengersWithSeats = seatAssignmentService.assignSeatsAutomatically(passengers, vehicleType);
            
            // Create seat map
            Map<String, Object> seatMap = seatAssignmentService.getSeatMap(passengersWithSeats, vehicleType);

            // Create roster data JSON
            Map<String, Object> rosterData = new HashMap<>();
            rosterData.put("flight", flight);
            rosterData.put("pilots", pilots);
            rosterData.put("cabinCrew", createCabinCrewList(chiefs, regulars, chefs));
            rosterData.put("passengers", passengersWithSeats);
            rosterData.put("seatMap", seatMap);
            rosterData.put("summary", createSummary(pilots, chiefs, regulars, chefs, passengersWithSeats));

            roster.setRosterData(objectMapper.writeValueAsString(rosterData));

            // Save roster first
            FlightRoster savedRoster = flightRosterRepository.save(roster);
            
            // Update pilot availability to false (they are now assigned)
            try {
                List<Long> pilotIds = pilots.stream()
                    .map(pilot -> ((Number) pilot.get("id")).longValue())
                    .collect(Collectors.toList());
                
                if (!pilotIds.isEmpty()) {
                    pilotClient.updateBulkAvailability(pilotIds, false);
                }
            } catch (Exception e) {
                // Log error but don't fail roster creation
                System.err.println("Warning: Could not update pilot availability: " + e.getMessage());
            }

            return savedRoster;

        } catch (Exception e) {
            throw new RuntimeException("Error creating roster: " + e.getMessage(), e);
        }
    }

    private List<Map<String, Object>> createCabinCrewList(List<Map<String, Object>> chiefs, 
                                                         List<Map<String, Object>> regulars, 
                                                         List<Map<String, Object>> chefs) {
        List<Map<String, Object>> cabinCrew = new ArrayList<>();
        cabinCrew.addAll(chiefs);
        cabinCrew.addAll(regulars);
        cabinCrew.addAll(chefs);
        return cabinCrew;
    }

    private Map<String, Object> createSummary(List<Map<String, Object>> pilots, 
                                            List<Map<String, Object>> chiefs, 
                                            List<Map<String, Object>> regulars, 
                                            List<Map<String, Object>> chefs, 
                                            List<Map<String, Object>> passengers) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPilots", pilots.size());
        summary.put("totalCabinCrew", chiefs.size() + regulars.size() + chefs.size());
        summary.put("totalPassengers", passengers.size());
        summary.put("totalPeople", pilots.size() + chiefs.size() + regulars.size() + chefs.size() + passengers.size());
        return summary;
    }

    public boolean deleteRoster(Long id) {
        Optional<FlightRoster> roster = flightRosterRepository.findById(id);
        if (roster.isPresent()) {
            roster.get().setIsActive(false);
            flightRosterRepository.save(roster.get());
            return true;
        }
        return false;
    }

    public String exportRosterAsJson(Long id) {
        FlightRoster roster = flightRosterRepository.findById(id).orElse(null);
        if (roster != null) {
            return roster.getRosterData();
        }
        return null;
    }

    // Crew Selection Methods
    public List<?> getAvailablePilots() {
        try {
            return pilotClient.getAllPilots();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch pilots: " + e.getMessage());
        }
    }

    public List<?> getAvailableCabinCrew() {
        try {
            return cabinClient.getAllAttendants();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch cabin crew: " + e.getMessage());
        }
    }

    public FlightRoster assignCrewManually(Long rosterId, CrewAssignmentRequest request) {
        FlightRoster roster = flightRosterRepository.findById(rosterId)
                .orElseThrow(() -> new RuntimeException("Roster not found"));

        try {
            // Parse existing roster data
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> rosterData = mapper.readValue(roster.getRosterData(), Map.class);
            
            // Update crew assignments - REPLACE existing crew, don't add to it
            List<?> pilots = new ArrayList<>();
            List<?> cabinCrew = new ArrayList<>();
            List<?> passengers = (List<?>) rosterData.get("passengers");
            
            // Only assign pilots if provided
            if (request.getPilotIds() != null && !request.getPilotIds().isEmpty()) {
                pilots = pilotClient.getPilotsByIds(request.getPilotIds());
            }
            rosterData.put("pilots", pilots);
            
            // Only assign cabin crew if provided
            if (request.getCabinCrewIds() != null && !request.getCabinCrewIds().isEmpty()) {
                cabinCrew = cabinClient.getAttendantsByIds(request.getCabinCrewIds());
            }
            rosterData.put("cabinCrew", cabinCrew);
            
            // Re-assign seats if passengers exist
            if (passengers != null && !passengers.isEmpty()) {
                Map<String, Object> flight = (Map<String, Object>) rosterData.get("flight");
                if (flight != null && flight.get("vehicleType") != null) {
                    Map<String, Object> vehicleType = (Map<String, Object>) flight.get("vehicleType");
                    List<Map<String, Object>> passengersWithSeats = seatAssignmentService.assignSeatsAutomatically(passengers, vehicleType);
                    Map<String, Object> seatMap = seatAssignmentService.getSeatMap(passengersWithSeats, vehicleType);
                    
                    rosterData.put("passengers", passengersWithSeats);
                    rosterData.put("seatMap", seatMap);
                }
            }
            
            // Update summary with new crew counts
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalPilots", pilots != null ? pilots.size() : 0);
            summary.put("totalCabinCrew", cabinCrew != null ? cabinCrew.size() : 0);
            summary.put("totalPassengers", passengers != null ? passengers.size() : 0);
            summary.put("totalPeople", 
                (pilots != null ? pilots.size() : 0) + 
                (cabinCrew != null ? cabinCrew.size() : 0) + 
                (passengers != null ? passengers.size() : 0)
            );
            rosterData.put("summary", summary);
            
            rosterData.put("assignmentType", request.getAssignmentType());
            rosterData.put("lastUpdated", LocalDateTime.now().toString());
            
            // Save updated roster
            roster.setRosterData(mapper.writeValueAsString(rosterData));
            return flightRosterRepository.save(roster);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to assign crew: " + e.getMessage());
        }
    }

    // Flight Info Methods
    public List<?> getAllFlights() {
        try {
            return flightInfoClient.getAllFlights();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch flights: " + e.getMessage());
        }
    }

    public Object getFlightByNumber(String flightNumber) {
        try {
            return flightInfoClient.getFlightByNumber(flightNumber);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch flight: " + e.getMessage());
        }
    }
}
