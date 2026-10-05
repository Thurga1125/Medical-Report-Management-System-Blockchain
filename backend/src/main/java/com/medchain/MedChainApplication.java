package com.medchain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true)
public class MedChainApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedChainApplication.class, args);
    }
}
