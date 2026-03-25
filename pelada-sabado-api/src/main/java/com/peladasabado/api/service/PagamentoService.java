package com.peladasabado.api.service;

import com.peladasabado.api.model.Jogador;
import com.peladasabado.api.model.Pagamento;
import com.peladasabado.api.model.Pelada;
import com.peladasabado.api.model.PresencaPelada;
import com.peladasabado.api.repository.JogadorRepository;
import com.peladasabado.api.repository.PagamentoRepository;
import com.peladasabado.api.repository.PeladaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PagamentoService {

    @Autowired
    private PagamentoRepository pagamentoRepository;

    @Autowired
    private JogadorRepository jogadorRepository;

    @Autowired
    private PeladaRepository peladaRepository;

    /**
     * Retorna (e gera se necessário) mensalidades do mês para todos os mensalistas/goleiros ativos.
     * Valor buscado da primeira pelada do mês; fallback 70.
     */
    private static final String MES_MINIMO = "2026-01";

    public List<Pagamento> gerarOuBuscarMensalidades(String mesAno) {
        if (mesAno.compareTo(MES_MINIMO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mensalidades disponíveis apenas a partir de Janeiro de 2026");
        }
        int valorMensalista = 70;
        List<Pelada> peladasMes = peladaRepository.findByDataStartingWith(mesAno);
        if (!peladasMes.isEmpty() && peladasMes.get(0).getValorMensalista() != null) {
            valorMensalista = peladasMes.get(0).getValorMensalista();
        }

        final String referencia = "mes-" + mesAno;
        final int valorFinal = valorMensalista;

        List<Jogador> mensalistas = jogadorRepository.findAll().stream()
                .filter(j -> Boolean.TRUE.equals(j.getAtivo())
                        && ("mensalista".equals(j.getTipo()) || "goleiro".equals(j.getTipo())))
                .collect(Collectors.toList());

        for (Jogador j : mensalistas) {
            if (!pagamentoRepository.findByJogadorIdAndTipoAndReferencia(j.getId(), "mensalidade", referencia).isPresent()) {
                Pagamento p = new Pagamento();
                p.setJogadorId(j.getId());
                p.setTipo("mensalidade");
                p.setReferencia(referencia);
                p.setMesAno(mesAno);
                p.setValor(valorFinal);
                pagamentoRepository.save(p);
            }
        }

        return pagamentoRepository.findByMesAno(mesAno);
    }

    /**
     * Retorna (e gera se necessário) diárias dos convidados confirmados de uma pelada.
     * Valor buscado do valorDiaria da pelada; fallback 25.
     */
    public List<Pagamento> gerarOuBuscarDiarias(Long peladaId) {
        Pelada pelada = peladaRepository.findById(peladaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pelada não encontrada"));

        int valorDiaria = pelada.getValorDiaria() != null ? pelada.getValorDiaria() : 25;
        final String referencia = "pelada-" + peladaId;
        final int valorFinal = valorDiaria;

        List<Long> confirmadosIds = pelada.getPresencas().stream()
                .filter(pr -> "confirmado".equals(pr.getStatus()) || "atrasado".equals(pr.getStatus()))
                .map(PresencaPelada::getJogadorId)
                .collect(Collectors.toList());

        List<Long> convidadosIds = jogadorRepository.findAllById(confirmadosIds).stream()
                .filter(j -> "convidado".equals(j.getTipo()))
                .map(Jogador::getId)
                .collect(Collectors.toList());

        for (Long jogadorId : convidadosIds) {
            if (!pagamentoRepository.findByJogadorIdAndTipoAndReferencia(jogadorId, "diaria", referencia).isPresent()) {
                Pagamento p = new Pagamento();
                p.setJogadorId(jogadorId);
                p.setTipo("diaria");
                p.setReferencia(referencia);
                p.setPeladaId(peladaId);
                p.setValor(valorFinal);
                pagamentoRepository.save(p);
            }
        }

        return pagamentoRepository.findByPeladaId(peladaId);
    }

    public Pagamento marcarPago(Long id) {
        Pagamento p = pagamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado"));
        p.setPago(true);
        p.setDataPagamento(LocalDate.now().toString());
        return pagamentoRepository.save(p);
    }

    public Pagamento marcarPendente(Long id) {
        Pagamento p = pagamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado"));
        p.setPago(false);
        p.setDataPagamento(null);
        return pagamentoRepository.save(p);
    }

    public List<Pagamento> atualizarValorDiarias(Long peladaId, int novoValor) {
        List<Pagamento> diarias = pagamentoRepository.findByPeladaId(peladaId);
        for (Pagamento p : diarias) {
            p.setValor(novoValor);
            pagamentoRepository.save(p);
        }
        return pagamentoRepository.findByPeladaId(peladaId);
    }

    public void deletar(Long id) {
        pagamentoRepository.deleteById(id);
    }

    public List<Pagamento> getAll() {
        return pagamentoRepository.findAll().stream()
                .filter(p -> {
                    if ("mensalidade".equals(p.getTipo()) && p.getMesAno() != null) {
                        return p.getMesAno().compareTo(MES_MINIMO) >= 0;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }
}
