package com.peladasabado.api.model;

import com.peladasabado.api.converter.PresencaListConverter;
import com.peladasabado.api.converter.TimeListConverter;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "peladas")
public class Pelada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Formato ISO date: "2026-03-21" */
    @Column(nullable = false)
    private String data;

    private String local;
    private String horario;
    private Integer valorMensalista;
    private Integer valorDiaria;
    private Integer valorMulta;
    private String pix;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = PresencaListConverter.class)
    private List<PresencaPelada> presencas = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    @Convert(converter = TimeListConverter.class)
    private List<TimeJogo> times = new ArrayList<>();

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

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }

    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }

    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }

    public Integer getValorMensalista() { return valorMensalista; }
    public void setValorMensalista(Integer valorMensalista) { this.valorMensalista = valorMensalista; }

    public Integer getValorDiaria() { return valorDiaria; }
    public void setValorDiaria(Integer valorDiaria) { this.valorDiaria = valorDiaria; }

    public Integer getValorMulta() { return valorMulta; }
    public void setValorMulta(Integer valorMulta) { this.valorMulta = valorMulta; }

    public String getPix() { return pix; }
    public void setPix(String pix) { this.pix = pix; }

    public List<PresencaPelada> getPresencas() { return presencas; }
    public void setPresencas(List<PresencaPelada> presencas) { this.presencas = presencas; }

    public List<TimeJogo> getTimes() { return times; }
    public void setTimes(List<TimeJogo> times) { this.times = times; }

    public String getCriadoEm() { return criadoEm; }
    public void setCriadoEm(String criadoEm) { this.criadoEm = criadoEm; }
}
