package com.peladasabado.api.controller;

import com.peladasabado.api.model.Pelada;
import com.peladasabado.api.service.PeladaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peladas")
public class PeladaController {

    @Autowired
    private PeladaService service;

    @GetMapping
    public List<Pelada> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Pelada getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<Pelada> create(@RequestBody Pelada pelada) {
        Pelada criada = service.create(pelada);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    public Pelada update(@PathVariable Long id, @RequestBody Pelada pelada) {
        return service.update(id, pelada);
    }

    @PatchMapping("/{id}")
    public Pelada patch(@PathVariable Long id, @RequestBody Pelada pelada) {
        return service.update(id, pelada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
