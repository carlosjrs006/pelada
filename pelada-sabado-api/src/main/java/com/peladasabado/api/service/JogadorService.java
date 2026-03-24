package com.peladasabado.api.service;

import com.peladasabado.api.model.Jogador;
import com.peladasabado.api.repository.JogadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class JogadorService {

    @Autowired
    private JogadorRepository repository;

    public List<Jogador> findAll() {
        return repository.findAll();
    }

    public Jogador findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Jogador não encontrado: " + id));
    }

    public Jogador create(Jogador jogador) {
        jogador.setId(null); // garante que vai gerar novo id
        return repository.save(jogador);
    }

    public Jogador update(Long id, Jogador jogador) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Jogador não encontrado: " + id);
        }
        jogador.setId(id);
        return repository.save(jogador);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Jogador não encontrado: " + id);
        }
        repository.deleteById(id);
    }

    public long count() {
        return repository.count();
    }
}
