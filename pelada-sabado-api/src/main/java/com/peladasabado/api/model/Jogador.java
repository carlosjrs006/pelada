package com.peladasabado.api.model;

import javax.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "jogadores")
public class Jogador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private Integer estrelas = 3;

    /**
     * mensalista | convidado | goleiro
     */
    @Column(nullable = false)
    private String tipo = "mensalista";

    private Integer numero;

    @Column(nullable = false)
    private Boolean ativo = true;

    private String criadoEm;

    @PrePersist
    protected void prePersist() {
        if (criadoEm == null || criadoEm.isEmpty()) {
            criadoEm = Instant.now().toString();
        }
    }

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public Integer getEstrelas() { return estrelas; }
    public void setEstrelas(Integer estrelas) { this.estrelas = estrelas; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getCriadoEm() { return criadoEm; }
    public void setCriadoEm(String criadoEm) { this.criadoEm = criadoEm; }
}
