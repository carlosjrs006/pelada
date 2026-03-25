package com.peladasabado.api.controller;

import com.peladasabado.api.model.Pagamento;
import com.peladasabado.api.service.PagamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagamentos")
public class PagamentoController {

    @Autowired
    private PagamentoService service;

    /** Retorna todos os pagamentos (para visão acumulada). */
    @GetMapping
    public List<Pagamento> getAll() {
        return service.getAll();
    }

    /** Retorna (e gera se necessário) mensalidades do mês. mesAno = "2026-03" */
    @GetMapping("/mes/{mesAno}")
    public List<Pagamento> getMensalidades(@PathVariable String mesAno) {
        return service.gerarOuBuscarMensalidades(mesAno);
    }

    /** Retorna (e gera se necessário) diárias dos convidados da pelada. */
    @GetMapping("/pelada/{peladaId}")
    public List<Pagamento> getDiarias(@PathVariable Long peladaId) {
        return service.gerarOuBuscarDiarias(peladaId);
    }

    /** Marca pagamento como pago (registra data de hoje). */
    @PatchMapping("/{id}/pagar")
    public Pagamento pagar(@PathVariable Long id) {
        return service.marcarPago(id);
    }

    /** Desfaz pagamento (volta para pendente). */
    @PatchMapping("/{id}/desfazer")
    public Pagamento desfazer(@PathVariable Long id) {
        return service.marcarPendente(id);
    }

    /** Atualiza o valor de todas as diárias de uma pelada. */
    @PutMapping("/pelada/{peladaId}/valor")
    public List<Pagamento> atualizarValorDiarias(@PathVariable Long peladaId, @RequestParam int valor) {
        return service.atualizarValorDiarias(peladaId, valor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.ok().build();
    }
}
