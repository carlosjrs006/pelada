package com.peladasabado.api.model;

/**
 * POJO (não entidade JPA) — serializado como JSON dentro de Pelada.
 */
public class PresencaPelada {

    private Long jogadorId;

    /**
     * confirmado | ausente | pendente | atrasado
     */
    private String status = "pendente";

    private boolean multa = false;

    private Integer gols = 0;

    private Integer assistencias = 0;

    public PresencaPelada() {}

    public Long getJogadorId() { return jogadorId; }
    public void setJogadorId(Long jogadorId) { this.jogadorId = jogadorId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isMulta() { return multa; }
    public void setMulta(boolean multa) { this.multa = multa; }

    public Integer getGols() { return gols; }
    public void setGols(Integer gols) { this.gols = gols != null ? gols : 0; }

    public Integer getAssistencias() { return assistencias; }
    public void setAssistencias(Integer assistencias) { this.assistencias = assistencias != null ? assistencias : 0; }
}
