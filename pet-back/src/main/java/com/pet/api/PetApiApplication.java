package com.pet.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PetApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(PetApiApplication.class, args);
	}

}
