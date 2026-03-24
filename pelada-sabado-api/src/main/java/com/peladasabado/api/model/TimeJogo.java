package com.peladasabado.api.model;

import java.util.ArrayList;
import java.util.List;

/**
 * POJO (não entidade JPA) — serializado como JSON dentro de Pelada.
 */
public class TimeJogo {

    private Long id;
    private String nome;
    private String cor;
    private List<Long> jogadores = new ArrayList<>();
    private Long goleiro;
    private int vitorias = 0;
    private int empates = 0;
    private int derrotas = 0;

    public TimeJogo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCor() { return cor; }
    public void setCor(String cor) { this.cor = cor; }

    public List<Long> getJogadores() { return jogadores; }
    public void setJogadores(List<Long> jogadores) { this.jogadores = jogadores; }

    public Long getGoleiro() { return goleiro; }
    public void setGoleiro(Long goleiro) { this.goleiro = goleiro; }

    public int getVitorias() { return vitorias; }
    public void setVitorias(int vitorias) { this.vitorias = vitorias; }

    public int getEmpates() { return empates; }
    public void setEmpates(int empates) { this.empates = empates; }

    public int getDerrotas() { return derrotas; }
    public void setDerrotas(int derrotas) { this.derrotas = derrotas; }
}
