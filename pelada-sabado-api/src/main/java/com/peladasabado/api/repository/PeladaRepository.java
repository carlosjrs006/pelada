package com.peladasabado.api.repository;

import com.peladasabado.api.model.Pelada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeladaRepository extends JpaRepository<Pelada, Long> {
    Optional<Pelada> findByData(String data);
}
