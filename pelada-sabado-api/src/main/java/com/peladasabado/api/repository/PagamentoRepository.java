package com.peladasabado.api.repository;

import com.peladasabado.api.model.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    List<Pagamento> findByMesAno(String mesAno);
    List<Pagamento> findByPeladaId(Long peladaId);
    Optional<Pagamento> findByJogadorIdAndTipoAndReferencia(Long jogadorId, String tipo, String referencia);
    List<Pagamento> findByTipo(String tipo);
    List<Pagamento> findByPago(boolean pago);
}
