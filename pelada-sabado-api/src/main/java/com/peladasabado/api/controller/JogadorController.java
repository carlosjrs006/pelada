package com.peladasabado.api.controller;

import com.peladasabado.api.model.Jogador;
import com.peladasabado.api.service.JogadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jogadores")
public class JogadorController {

    @Autowired
    private JogadorService service;

    @GetMapping
    public List<Jogador> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Jogador getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<Jogador> create(@RequestBody Jogador jogador) {
        Jogador criado = service.create(jogador);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public Jogador update(@PathVariable Long id, @RequestBody Jogador jogador) {
        return service.update(id, jogador);
    }

    @PatchMapping("/{id}")
    public Jogador patch(@PathVariable Long id, @RequestBody Jogador jogador) {
        // Por simplicidade, PATCH funciona igual a PUT (substitui o recurso inteiro)
        return service.update(id, jogador);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
