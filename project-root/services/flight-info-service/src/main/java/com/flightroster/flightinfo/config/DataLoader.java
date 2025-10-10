package com.flightroster.flightinfo.config;

import com.flightroster.flightinfo.entity.Airport;
import com.flightroster.flightinfo.entity.Flight;
import com.flightroster.flightinfo.entity.VehicleType;
import com.flightroster.flightinfo.repository.AirportRepository;
import com.flightroster.flightinfo.repository.FlightRepository;
import com.flightroster.flightinfo.repository.VehicleTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private AirportRepository airportRepository;

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Override
    public void run(String... args) throws Exception {
        // Örnek havaalanları - sadece yoksa ekle
        if (airportRepository.findByAirportCode("IST").isEmpty()) {
            Airport istanbul = new Airport();
            istanbul.setAirportCode("IST");
            istanbul.setAirportName("Istanbul Airport");
            istanbul.setCity("Istanbul");
            istanbul.setCountry("Turkey");
            airportRepository.save(istanbul);
        }

        if (airportRepository.findByAirportCode("ESB").isEmpty()) {
            Airport ankara = new Airport();
            ankara.setAirportCode("ESB");
            ankara.setAirportName("Esenboga Airport");
            ankara.setCity("Ankara");
            ankara.setCountry("Turkey");
            airportRepository.save(ankara);
        }

        if (airportRepository.findByAirportCode("LHR").isEmpty()) {
            Airport london = new Airport();
            london.setAirportCode("LHR");
            london.setAirportName("Heathrow Airport");
            london.setCity("London");
            london.setCountry("UK");
            airportRepository.save(london);
        }

        if (airportRepository.findByAirportCode("CDG").isEmpty()) {
            Airport paris = new Airport();
            paris.setAirportCode("CDG");
            paris.setAirportName("Charles de Gaulle Airport");
            paris.setCity("Paris");
            paris.setCountry("France");
            airportRepository.save(paris);
        }

        if (airportRepository.findByAirportCode("TXL").isEmpty()) {
            Airport berlin = new Airport();
            berlin.setAirportCode("TXL");
            berlin.setAirportName("Tegel Airport");
            berlin.setCity("Berlin");
            berlin.setCountry("Germany");
            airportRepository.save(berlin);
        }

        if (airportRepository.findByAirportCode("FCO").isEmpty()) {
            Airport rome = new Airport();
            rome.setAirportCode("FCO");
            rome.setAirportName("Fiumicino Airport");
            rome.setCity("Rome");
            rome.setCountry("Italy");
            airportRepository.save(rome);
        }

        // Örnek uçak tipleri - sadece yoksa ekle
        if (vehicleTypeRepository.findByTypeName("Boeing 737-800").isEmpty()) {
            VehicleType boeing737 = new VehicleType();
            boeing737.setTypeName("Boeing 737-800");
            boeing737.setTotalSeats(189);
            boeing737.setBusinessSeats(20);
            boeing737.setEconomySeats(169);
            boeing737.setMaxPilots(2);
            boeing737.setMaxCabinCrew(6);
            boeing737.setSeatingPlan("{\"rows\": 31, \"seatsPerRow\": 6, \"businessRows\": 4}");
            boeing737.setStandardMenu("{\"meals\": [\"Chicken\", \"Beef\", \"Vegetarian\"]}");
            vehicleTypeRepository.save(boeing737);
        }

        if (vehicleTypeRepository.findByTypeName("Airbus A320").isEmpty()) {
            VehicleType airbus320 = new VehicleType();
            airbus320.setTypeName("Airbus A320");
            airbus320.setTotalSeats(180);
            airbus320.setBusinessSeats(16);
            airbus320.setEconomySeats(164);
            airbus320.setMaxPilots(2);
            airbus320.setMaxCabinCrew(5);
            airbus320.setSeatingPlan("{\"rows\": 30, \"seatsPerRow\": 6, \"businessRows\": 3}");
            airbus320.setStandardMenu("{\"meals\": [\"Fish\", \"Pasta\", \"Salad\"]}");
            vehicleTypeRepository.save(airbus320);
        }

        // Örnek uçuşlar - sadece yoksa ekle
        if (flightRepository.findByFlightNumber("TK001").isEmpty()) {
            Airport istanbul = airportRepository.findByAirportCode("IST").orElse(null);
            Airport ankara = airportRepository.findByAirportCode("ESB").orElse(null);
            VehicleType boeing737 = vehicleTypeRepository.findByTypeName("Boeing 737-800").orElse(null);
            
            if (istanbul != null && ankara != null && boeing737 != null) {
                Flight flight1 = new Flight();
                flight1.setFlightNumber("TK001");
                flight1.setFlightDate(LocalDateTime.of(2024, 1, 15, 10, 30));
                flight1.setDurationMinutes(90);
                flight1.setDistanceKm(350.0);
                flight1.setSourceAirport(istanbul);
                flight1.setDestinationAirport(ankara);
                flight1.setVehicleType(boeing737);
                flight1.setIsSharedFlight(false);
                flightRepository.save(flight1);
            }
        }

        if (flightRepository.findByFlightNumber("TK002").isEmpty()) {
            Airport istanbul = airportRepository.findByAirportCode("IST").orElse(null);
            Airport london = airportRepository.findByAirportCode("LHR").orElse(null);
            VehicleType airbus320 = vehicleTypeRepository.findByTypeName("Airbus A320").orElse(null);
            
            if (istanbul != null && london != null && airbus320 != null) {
                Flight flight2 = new Flight();
                flight2.setFlightNumber("TK002");
                flight2.setFlightDate(LocalDateTime.of(2024, 1, 15, 14, 45));
                flight2.setDurationMinutes(240);
                flight2.setDistanceKm(1200.0);
                flight2.setSourceAirport(istanbul);
                flight2.setDestinationAirport(london);
                flight2.setVehicleType(airbus320);
                flight2.setIsSharedFlight(false);
                flightRepository.save(flight2);
            }
        }

        // Yeni uçuşlar - TK003, TK004, TK005
        if (flightRepository.findByFlightNumber("TK003").isEmpty()) {
            Airport istanbul = airportRepository.findByAirportCode("IST").orElse(null);
            Airport paris = airportRepository.findByAirportCode("CDG").orElse(null);
            VehicleType boeing737 = vehicleTypeRepository.findByTypeName("Boeing 737-800").orElse(null);
            
            if (istanbul != null && paris != null && boeing737 != null) {
                Flight flight3 = new Flight();
                flight3.setFlightNumber("TK003");
                flight3.setFlightDate(LocalDateTime.of(2024, 1, 15, 16, 30));
                flight3.setDurationMinutes(180);
                flight3.setDistanceKm(1000.0);
                flight3.setSourceAirport(istanbul);
                flight3.setDestinationAirport(paris);
                flight3.setVehicleType(boeing737);
                flight3.setIsSharedFlight(false);
                flightRepository.save(flight3);
            }
        }

        if (flightRepository.findByFlightNumber("TK004").isEmpty()) {
            Airport istanbul = airportRepository.findByAirportCode("IST").orElse(null);
            Airport berlin = airportRepository.findByAirportCode("TXL").orElse(null);
            VehicleType airbus320 = vehicleTypeRepository.findByTypeName("Airbus A320").orElse(null);
            
            if (istanbul != null && berlin != null && airbus320 != null) {
                Flight flight4 = new Flight();
                flight4.setFlightNumber("TK004");
                flight4.setFlightDate(LocalDateTime.of(2024, 1, 15, 18, 45));
                flight4.setDurationMinutes(200);
                flight4.setDistanceKm(1100.0);
                flight4.setSourceAirport(istanbul);
                flight4.setDestinationAirport(berlin);
                flight4.setVehicleType(airbus320);
                flight4.setIsSharedFlight(false);
                flightRepository.save(flight4);
            }
        }

        if (flightRepository.findByFlightNumber("TK005").isEmpty()) {
            Airport istanbul = airportRepository.findByAirportCode("IST").orElse(null);
            Airport rome = airportRepository.findByAirportCode("FCO").orElse(null);
            VehicleType boeing737 = vehicleTypeRepository.findByTypeName("Boeing 737-800").orElse(null);
            
            if (istanbul != null && rome != null && boeing737 != null) {
                Flight flight5 = new Flight();
                flight5.setFlightNumber("TK005");
                flight5.setFlightDate(LocalDateTime.of(2024, 1, 15, 20, 15));
                flight5.setDurationMinutes(190);
                flight5.setDistanceKm(1050.0);
                flight5.setSourceAirport(istanbul);
                flight5.setDestinationAirport(rome);
                flight5.setVehicleType(boeing737);
                flight5.setIsSharedFlight(false);
                flightRepository.save(flight5);
            }
        }

        System.out.println("Örnek veriler yüklendi!");
    }
}
