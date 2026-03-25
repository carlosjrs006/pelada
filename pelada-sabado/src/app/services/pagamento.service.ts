import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagamento } from '../models/jogador.model';
import { API_BASE } from './api.service';

@Injectable({ providedIn: 'root' })
export class PagamentoService {
  constructor(private http: HttpClient) {}

  getMensalidades(mesAno: string): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${API_BASE}/pagamentos/mes/${mesAno}`);
  }

  getDiarias(peladaId: number): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${API_BASE}/pagamentos/pelada/${peladaId}`);
  }

  getAll(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${API_BASE}/pagamentos`);
  }

  pagar(id: number): Observable<Pagamento> {
    return this.http.patch<Pagamento>(`${API_BASE}/pagamentos/${id}/pagar`, {});
  }

  desfazer(id: number): Observable<Pagamento> {
    return this.http.patch<Pagamento>(`${API_BASE}/pagamentos/${id}/desfazer`, {});
  }

  atualizarValorDiarias(peladaId: number, valor: number): Observable<Pagamento[]> {
    return this.http.put<Pagamento[]>(`${API_BASE}/pagamentos/pelada/${peladaId}/valor?valor=${valor}`, {});
  }
}
