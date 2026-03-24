package com.peladasabado.api.service;

import com.peladasabado.api.model.Pelada;
import com.peladasabado.api.repository.PeladaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class PeladaService {

    @Autowired
    private PeladaRepository repository;

    public List<Pelada> findAll() {
        return repository.findAll();
    }

    public Pelada findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pelada não encontrada: " + id));
    }

    public Pelada create(Pelada pelada) {
        pelada.setId(null);
        if (pelada.getPresencas() == null) pelada.setPresencas(new ArrayList<>());
        if (pelada.getTimes() == null) pelada.setTimes(new ArrayList<>());
        return repository.save(pelada);
    }

    public Pelada update(Long id, Pelada pelada) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pelada não encontrada: " + id);
        }
        pelada.setId(id);
        if (pelada.getPresencas() == null) pelada.setPresencas(new ArrayList<>());
        if (pelada.getTimes() == null) pelada.setTimes(new ArrayList<>());
        return repository.save(pelada);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pelada não encontrada: " + id);
        }
        repository.deleteById(id);
    }
}
