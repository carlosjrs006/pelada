import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Jogador } from '../models/jogador.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class JogadorService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Jogador[]> {
    return this.api.get<Jogador[]>('jogadores');
  }

  getById(id: number): Observable<Jogador> {
    return this.api.get<Jogador>(`jogadores/${id}`);
  }

  add(jogador: Omit<Jogador, 'id' | 'criadoEm'>): Observable<Jogador> {
    return this.api.post<Jogador>('jogadores', { ...jogador, criadoEm: new Date().toISOString() });
  }

  update(jogador: Jogador): Observable<Jogador> {
    return this.api.put<Jogador>('jogadores', jogador.id, jogador);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>('jogadores', id);
  }

  private normalizar(nome: string): string {
    return nome.trim().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  findByNome(nome: string, jogadores: Jogador[]): Jogador | undefined {
    const n = this.normalizar(nome);
    return jogadores.find(j => this.normalizar(j.nome) === n);
  }

  detectarNovosNomes(nomes: string[], jogadores: Jogador[]): string[] {
    return nomes.filter(nome => {
      const n = this.normalizar(nome);
      return n.length > 0 && !jogadores.some(j => this.normalizar(j.nome) === n);
    });
  }
}
