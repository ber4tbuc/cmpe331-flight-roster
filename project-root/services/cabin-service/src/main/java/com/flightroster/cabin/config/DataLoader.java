package com.flightroster.cabin.config;

import com.flightroster.cabin.entity.Attendant;
import com.flightroster.cabin.entity.AttendantType;
import com.flightroster.cabin.repository.AttendantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private AttendantRepository attendantRepository;

    @Override
    public void run(String... args) throws Exception {
        // Örnek kabin ekibi - sadece yoksa ekle
        if (attendantRepository.findByAttendantId("A001").isEmpty()) {
            Attendant attendant1 = new Attendant();
            attendant1.setAttendantId("A001");
            attendant1.setName("Fatma Yılmaz");
            attendant1.setAge(32);
            attendant1.setGender("Female");
            attendant1.setNationality("Turkish");
            attendant1.setKnownLanguages("[\"Turkish\", \"English\", \"French\"]");
            attendant1.setAttendantType(AttendantType.CHIEF);
            attendant1.setVehicleRestrictions("[\"Boeing 737-800\", \"Airbus A320\"]");
            attendant1.setIsAvailable(true);
            attendantRepository.save(attendant1);
        }

        if (attendantRepository.findByAttendantId("A002").isEmpty()) {
            Attendant attendant2 = new Attendant();
            attendant2.setAttendantId("A002");
            attendant2.setName("Mehmet Kaya");
            attendant2.setAge(28);
            attendant2.setGender("Male");
            attendant2.setNationality("Turkish");
            attendant2.setKnownLanguages("[\"Turkish\", \"English\"]");
            attendant2.setAttendantType(AttendantType.REGULAR);
            attendant2.setVehicleRestrictions("[\"Boeing 737-800\", \"Airbus A320\"]");
            attendant2.setIsAvailable(true);
            attendantRepository.save(attendant2);
        }

        if (attendantRepository.findByAttendantId("A003").isEmpty()) {
            Attendant attendant3 = new Attendant();
            attendant3.setAttendantId("A003");
            attendant3.setName("Ayşe Demir");
            attendant3.setAge(26);
            attendant3.setGender("Female");
            attendant3.setNationality("Turkish");
            attendant3.setKnownLanguages("[\"Turkish\", \"English\", \"German\"]");
            attendant3.setAttendantType(AttendantType.REGULAR);
            attendant3.setVehicleRestrictions("[\"Airbus A320\"]");
            attendant3.setIsAvailable(true);
            attendantRepository.save(attendant3);
        }

        if (attendantRepository.findByAttendantId("A004").isEmpty()) {
            Attendant attendant4 = new Attendant();
            attendant4.setAttendantId("A004");
            attendant4.setName("Ali Özkan");
            attendant4.setAge(35);
            attendant4.setGender("Male");
            attendant4.setNationality("Turkish");
            attendant4.setKnownLanguages("[\"Turkish\", \"English\"]");
            attendant4.setAttendantType(AttendantType.CHEF);
            attendant4.setVehicleRestrictions("[\"Boeing 737-800\", \"Airbus A320\"]");
            attendant4.setIsAvailable(true);
            attendant4.setRecipeTypes("[\"Turkish Cuisine\", \"Mediterranean\", \"Vegetarian\"]");
            attendantRepository.save(attendant4);
        }

        if (attendantRepository.findByAttendantId("A005").isEmpty()) {
            Attendant attendant5 = new Attendant();
            attendant5.setAttendantId("A005");
            attendant5.setName("Zeynep Şahin");
            attendant5.setAge(30);
            attendant5.setGender("Female");
            attendant5.setNationality("Turkish");
            attendant5.setKnownLanguages("[\"Turkish\", \"English\", \"French\"]");
            attendant5.setAttendantType(AttendantType.CHEF);
            attendant5.setVehicleRestrictions("[\"Boeing 737-800\"]");
            attendant5.setIsAvailable(true);
            attendant5.setRecipeTypes("[\"International Cuisine\", \"Asian Fusion\", \"Healthy Options\"]");
            attendantRepository.save(attendant5);
        }

        if (attendantRepository.findByAttendantId("A006").isEmpty()) {
            Attendant attendant6 = new Attendant();
            attendant6.setAttendantId("A006");
            attendant6.setName("Can Yıldız");
            attendant6.setAge(29);
            attendant6.setGender("Male");
            attendant6.setNationality("Turkish");
            attendant6.setKnownLanguages("[\"Turkish\", \"English\"]");
            attendant6.setAttendantType(AttendantType.REGULAR);
            attendant6.setVehicleRestrictions("[\"Boeing 737-800\", \"Airbus A320\"]");
            attendant6.setIsAvailable(true);
            attendantRepository.save(attendant6);
        }

        // Yeni kabin ekibi üyeleri ekle
        if (attendantRepository.findByAttendantId("A007").isEmpty()) {
            Attendant attendant7 = new Attendant();
            attendant7.setAttendantId("A007");
            attendant7.setName("Sarah Johnson");
            attendant7.setAge(27);
            attendant7.setGender("Female");
            attendant7.setNationality("American");
            attendant7.setKnownLanguages("[\"English\", \"Spanish\"]");
            attendant7.setAttendantType(AttendantType.REGULAR);
            attendant7.setVehicleRestrictions("[\"Boeing 737-800\", \"Airbus A320\"]");
            attendant7.setIsAvailable(true);
            attendantRepository.save(attendant7);
        }

        if (attendantRepository.findByAttendantId("A008").isEmpty()) {
            Attendant attendant8 = new Attendant();
            attendant8.setAttendantId("A008");
            attendant8.setName("Klaus Weber");
            attendant8.setAge(34);
            attendant8.setGender("Male");
            attendant8.setNationality("German");
            attendant8.setKnownLanguages("[\"German\", \"English\", \"French\"]");
            attendant8.setAttendantType(AttendantType.CHIEF);
            attendant8.setVehicleRestrictions("[\"Airbus A320\"]");
            attendant8.setIsAvailable(true);
            attendantRepository.save(attendant8);
        }

        if (attendantRepository.findByAttendantId("A009").isEmpty()) {
            Attendant attendant9 = new Attendant();
            attendant9.setAttendantId("A009");
            attendant9.setName("Isabella Rossi");
            attendant9.setAge(31);
            attendant9.setGender("Female");
            attendant9.setNationality("Italian");
            attendant9.setKnownLanguages("[\"Italian\", \"English\", \"French\"]");
            attendant9.setAttendantType(AttendantType.CHEF);
            attendant9.setVehicleRestrictions("[\"Boeing 737-800\", \"Airbus A320\"]");
            attendant9.setIsAvailable(true);
            attendant9.setRecipeTypes("[\"Italian Cuisine\", \"Mediterranean\", \"Fine Dining\"]");
            attendantRepository.save(attendant9);
        }

        if (attendantRepository.findByAttendantId("A010").isEmpty()) {
            Attendant attendant10 = new Attendant();
            attendant10.setAttendantId("A010");
            attendant10.setName("Ahmed Hassan");
            attendant10.setAge(33);
            attendant10.setGender("Male");
            attendant10.setNationality("Egyptian");
            attendant10.setKnownLanguages("[\"Arabic\", \"English\", \"French\"]");
            attendant10.setAttendantType(AttendantType.REGULAR);
            attendant10.setVehicleRestrictions("[\"Boeing 737-800\", \"Airbus A320\"]");
            attendant10.setIsAvailable(true);
            attendantRepository.save(attendant10);
        }

        if (attendantRepository.findByAttendantId("A011").isEmpty()) {
            Attendant attendant11 = new Attendant();
            attendant11.setAttendantId("A011");
            attendant11.setName("Elena Petrov");
            attendant11.setAge(28);
            attendant11.setGender("Female");
            attendant11.setNationality("Russian");
            attendant11.setKnownLanguages("[\"Russian\", \"English\", \"German\"]");
            attendant11.setAttendantType(AttendantType.REGULAR);
            attendant11.setVehicleRestrictions("[\"Airbus A320\"]");
            attendant11.setIsAvailable(true);
            attendantRepository.save(attendant11);
        }

        if (attendantRepository.findByAttendantId("A012").isEmpty()) {
            Attendant attendant12 = new Attendant();
            attendant12.setAttendantId("A012");
            attendant12.setName("Carlos Mendez");
            attendant12.setAge(36);
            attendant12.setGender("Male");
            attendant12.setNationality("Mexican");
            attendant12.setKnownLanguages("[\"Spanish\", \"English\"]");
            attendant12.setAttendantType(AttendantType.CHEF);
            attendant12.setVehicleRestrictions("[\"Boeing 737-800\"]");
            attendant12.setIsAvailable(true);
            attendant12.setRecipeTypes("[\"Mexican Cuisine\", \"Latin American\", \"Spicy Dishes\"]");
            attendantRepository.save(attendant12);
        }

        if (attendantRepository.findByAttendantId("A013").isEmpty()) {
            Attendant attendant13 = new Attendant();
            attendant13.setAttendantId("A013");
            attendant13.setName("Yuki Tanaka");
            attendant13.setAge(25);
            attendant13.setGender("Female");
            attendant13.setNationality("Japanese");
            attendant13.setKnownLanguages("[\"Japanese\", \"English\"]");
            attendant13.setAttendantType(AttendantType.REGULAR);
            attendant13.setVehicleRestrictions("[\"Boeing 737-800\", \"Airbus A320\"]");
            attendant13.setIsAvailable(true);
            attendantRepository.save(attendant13);
        }

        if (attendantRepository.findByAttendantId("A014").isEmpty()) {
            Attendant attendant14 = new Attendant();
            attendant14.setAttendantId("A014");
            attendant14.setName("Mohammed Al-Rashid");
            attendant14.setAge(40);
            attendant14.setGender("Male");
            attendant14.setNationality("Saudi Arabian");
            attendant14.setKnownLanguages("[\"Arabic\", \"English\", \"French\"]");
            attendant14.setAttendantType(AttendantType.CHIEF);
            attendant14.setVehicleRestrictions("[\"Boeing 737-800\", \"Airbus A320\"]");
            attendant14.setIsAvailable(true);
            attendantRepository.save(attendant14);
        }

        if (attendantRepository.findByAttendantId("A015").isEmpty()) {
            Attendant attendant15 = new Attendant();
            attendant15.setAttendantId("A015");
            attendant15.setName("Sophie Martin");
            attendant15.setAge(29);
            attendant15.setGender("Female");
            attendant15.setNationality("French");
            attendant15.setKnownLanguages("[\"French\", \"English\", \"Spanish\"]");
            attendant15.setAttendantType(AttendantType.REGULAR);
            attendant15.setVehicleRestrictions("[\"Airbus A320\"]");
            attendant15.setIsAvailable(true);
            attendantRepository.save(attendant15);
        }

        System.out.println("Örnek kabin ekibi verileri yüklendi!");
    }
}
