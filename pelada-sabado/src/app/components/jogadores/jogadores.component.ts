import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { JogadorService } from '../../services/jogador.service';
import { PeladaService } from '../../services/pelada.service';
import { Jogador, Pelada, TipoJogador } from '../../models/jogador.model';

@Component({
  selector: 'app-jogadores',
  templateUrl: './jogadores.component.html',
  styleUrls: ['./jogadores.component.scss']
})
export class JogadoresComponent implements OnInit {
  jogadores: Jogador[] = [];
  peladas: Pelada[] = [];
  filtroTipo: TipoJogador | 'todos' = 'todos';
  filtroBusca = '';
  modoEdicao: Jogador | null = null;
  showForm = false;
  carregando = true;
  salvando = false;

  novoJogador: Omit<Jogador, 'id' | 'criadoEm'> = {
    nome: '', estrelas: 3, tipo: 'mensalista', numero: undefined, ativo: true
  };

  constructor(private jogadorService: JogadorService, private peladaService: PeladaService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    forkJoin({
      jogadores: this.jogadorService.getAll(),
      peladas: this.peladaService.getAll()
    }).subscribe(({ jogadores, peladas }) => {
      this.jogadores = jogadores;
      this.peladas = peladas;
      this.carregando = false;
    });
  }

  get jogadoresFiltrados(): Jogador[] {
    return this.jogadores.filter(j => {
      const tipoOk = this.filtroTipo === 'todos' || j.tipo === this.filtroTipo;
      const buscaOk = !this.filtroBusca || j.nome.toLowerCase().includes(this.filtroBusca.toLowerCase());
      return tipoOk && buscaOk;
    });
  }

  salvar(): void {
    if (!this.novoJogador.nome.trim()) return;
    this.salvando = true;
    if (this.modoEdicao) {
      this.jogadorService.update({ ...this.modoEdicao, ...this.novoJogador }).subscribe(() => {
        this.carregar();
        this.cancelar();
        this.salvando = false;
      });
    } else {
      this.jogadorService.add(this.novoJogador).subscribe(() => {
        this.carregar();
        this.cancelar();
        this.salvando = false;
      });
    }
  }

  editar(j: Jogador): void {
    this.modoEdicao = j;
    this.novoJogador = { nome: j.nome, estrelas: j.estrelas, tipo: j.tipo, numero: j.numero, ativo: j.ativo };
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluir(id: number): void {
    if (!confirm('Excluir jogador?')) return;
    this.jogadorService.delete(id).subscribe(() => this.carregar());
  }

  cancelar(): void {
    this.modoEdicao = null;
    this.showForm = false;
    this.novoJogador = { nome: '', estrelas: 3, tipo: 'mensalista', numero: undefined, ativo: true };
  }

  getIniciais(nome: string): string {
    return nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  getCorTipo(tipo: TipoJogador): string {
    return tipo === 'mensalista' ? 'success' : tipo === 'convidado' ? 'info' : 'warning';
  }

  getTotalGols(jogadorId: number): number {
    return this.peladas.reduce((sum, p) => {
      const presenca = p.presencas.find(pr => pr.jogadorId === jogadorId);
      return sum + (presenca?.gols ?? 0);
    }, 0);
  }

  getTotalAssistencias(jogadorId: number): number {
    return this.peladas.reduce((sum, p) => {
      const presenca = p.presencas.find(pr => pr.jogadorId === jogadorId);
      return sum + (presenca?.assistencias ?? 0);
    }, 0);
  }
}
