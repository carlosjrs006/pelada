package com.peladasabado.api.model;

import javax.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pagamentos")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "jogador_id", nullable = false)
    private Long jogadorId;

    /** "mensalidade" ou "diaria" */
    @Column(nullable = false)
    private String tipo;

    /** "mes-2026-03" para mensalidade, "pelada-5" para diaria */
    @Column(nullable = false)
    private String referencia;

    /** Apenas para mensalidades: "2026-03" */
    @Column(name = "mes_ano")
    private String mesAno;

    /** Apenas para diárias: id da pelada */
    @Column(name = "pelada_id")
    private Long peladaId;

    private Integer valor;

    @Column(nullable = false)
    private boolean pago = false;

    @Column(name = "data_pagamento")
    private String dataPagamento;

    @Column(name = "criado_em")
    private String criadoEm;

    @PrePersist
    protected void prePersist() {
        if (criadoEm == null || criadoEm.isEmpty()) {
            criadoEm = Instant.now().toString();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJogadorId() { return jogadorId; }
    public void setJogadorId(Long jogadorId) { this.jogadorId = jogadorId; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }

    public String getMesAno() { return mesAno; }
    public void setMesAno(String mesAno) { this.mesAno = mesAno; }

    public Long getPeladaId() { return peladaId; }
    public void setPeladaId(Long peladaId) { this.peladaId = peladaId; }

    public Integer getValor() { return valor; }
    public void setValor(Integer valor) { this.valor = valor; }

    public boolean isPago() { return pago; }
    public void setPago(boolean pago) { this.pago = pago; }

    public String getDataPagamento() { return dataPagamento; }
    public void setDataPagamento(String dataPagamento) { this.dataPagamento = dataPagamento; }

    public String getCriadoEm() { return criadoEm; }
    public void setCriadoEm(String criadoEm) { this.criadoEm = criadoEm; }
}
