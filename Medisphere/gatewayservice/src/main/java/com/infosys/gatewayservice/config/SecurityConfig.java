package com.infosys.gatewayservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                .authorizeExchange(exchange -> exchange

                        .pathMatchers(HttpMethod.OPTIONS,"/**").permitAll()

                        .pathMatchers("/actuator/**").permitAll()

                        .pathMatchers("/patient/save").hasAnyRole("ADMIN","PATIENT")

                        .pathMatchers("/patient/all").hasAnyRole("ADMIN","DOCTOR","PATIENT")

                        .pathMatchers(HttpMethod.GET,"/patient/**").permitAll()

                        .pathMatchers(HttpMethod.PUT,"/patient/**").hasAnyRole("ADMIN","PATIENT")

                        .pathMatchers(HttpMethod.DELETE,"/patient/**").hasRole("ADMIN")

                        .pathMatchers(HttpMethod.PUT,"/fhir/patient/*/description").hasRole("DOCTOR")

                        .pathMatchers(HttpMethod.GET,"/fhir/**").hasAnyRole("ADMIN","DOCTOR","PATIENT")

                        .pathMatchers(HttpMethod.POST,"/vitals/**").hasAnyRole("ADMIN","DOCTOR","PATIENT")

                        .pathMatchers(HttpMethod.PUT,"/vitals/**").hasAnyRole("ADMIN","DOCTOR","PATIENT")

                        .pathMatchers(HttpMethod.DELETE,"/vitals/**").hasRole("ADMIN")

                        .pathMatchers(HttpMethod.GET,"/vitals/**").hasAnyRole("ADMIN","DOCTOR","PATIENT")

                        .pathMatchers(HttpMethod.POST,"/consent/**").hasAnyRole("ADMIN","PATIENT")

                        .pathMatchers(HttpMethod.PUT,"/consent/**").hasAnyRole("ADMIN","PATIENT")

                        .pathMatchers(HttpMethod.DELETE,"/consent/**").hasRole("ADMIN")

                        .pathMatchers(HttpMethod.GET,"/consent/**").hasAnyRole("ADMIN","DOCTOR","PATIENT")

                        .pathMatchers(HttpMethod.POST,"/healthtwin/**").hasAnyRole("ADMIN","PATIENT")

                        .pathMatchers(HttpMethod.PUT,"/healthtwin/**").hasAnyRole("ADMIN","PATIENT")

                        .pathMatchers(HttpMethod.DELETE,"/healthtwin/**").hasRole("ADMIN")

                        .pathMatchers(HttpMethod.GET,"/healthtwin/**").hasAnyRole("ADMIN","DOCTOR","PATIENT")

                        .pathMatchers("/api/prediction/**").hasAnyRole("ADMIN","DOCTOR","PATIENT")
                        .pathMatchers("/api/explanation/**").hasAnyRole("ADMIN","DOCTOR","PATIENT")
                        .pathMatchers("/api/model/**").hasAnyRole("ADMIN","DOCTOR")

                        .anyExchange().permitAll()

                )

                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(
                                        new ReactiveJwtAuthenticationConverterAdapter(
                                                new KeycloakRoleConverter()
                                        )
                                )
                        )
                )

                .build();
    }
}