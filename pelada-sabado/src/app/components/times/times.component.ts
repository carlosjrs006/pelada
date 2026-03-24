import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PeladaService } from '../../services/pelada.service';
import { JogadorService } from '../../services/jogador.service';
import { Pelada, Time, Jogador } from '../../models/jogador.model';

@Component({
  selector: 'app-times',
  templateUrl: './times.component.html',
  styleUrls: ['./times.component.scss']
})
export class TimesComponent implements OnInit {
  peladas: Pelada[] = [];
  peladaSelecionada: Pelada | null = null;
  jogadores: Jogador[] = [];
  jogadoresPorTime = 6;
  sorteado = false;
  sorteando = false;
  carregando = true;

  constructor(
    private peladaService: PeladaService,
    private jogadorService: JogadorService
  ) {}

  ngOnInit(): void {
    forkJoin({
      peladas: this.peladaService.getAll(),
      jogadores: this.jogadorService.getAll()
    }).subscribe(({ peladas, jogadores }) => {
      this.jogadores = jogadores;
      this.peladas = peladas.sort((a, b) => b.data.localeCompare(a.data));
      const hoje = new Date().toISOString().split('T')[0];
      const proxima = peladas.filter(p => p.data >= hoje).sort((a, b) => a.data.localeCompare(b.data))[0];
      const selecionada = proxima ?? this.peladas[0] ?? null;
      if (selecionada) {
        this.peladaSelecionada = selecionada;
        this.sorteado = selecionada.times.length > 0;
      }
      this.carregando = false;
    });
  }

  selecionar(idx: number): void {
    this.peladaSelecionada = this.peladas[idx];
    this.sorteado = this.peladaSelecionada.times.length > 0;
  }

  sortear(): void {
    if (!this.peladaSelecionada) return;
    this.sorteando = true;
    this.peladaService.sortearTimes(this.peladaSelecionada, this.jogadores, this.jogadoresPorTime)
      .subscribe(peladaAtualizada => {
        this.peladaSelecionada = peladaAtualizada;
        this.sorteado = peladaAtualizada.times.length > 0;
        this.sorteando = false;
      });
  }

  get times(): Time[] {
    return this.peladaSelecionada?.times || [];
  }

  getJogadores(time: Time): Jogador[] {
    return time.jogadores
      .map(id => this.jogadores.find(j => j.id === id))
      .filter((j): j is Jogador => !!j);
  }

  getGoleiro(time: Time): Jogador | undefined {
    return time.goleiro ? this.jogadores.find(j => j.id === time.goleiro) : undefined;
  }

  getMediaEstrelas(time: Time): number {
    const jogs = this.getJogadores(time);
    if (!jogs.length) return 0;
    return Math.round((jogs.reduce((s, j) => s + j.estrelas, 0) / jogs.length) * 10) / 10;
  }

  getIniciais(nome: string): string {
    return nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  get confirmadosCount(): number {
    return this.peladaSelecionada?.presencas.filter(p => p.status === 'confirmado' || p.status === 'atrasado').length ?? 0;
  }

  ajustarResultado(time: Time, campo: 'vitorias' | 'empates' | 'derrotas', delta: number): void {
    if (!this.peladaSelecionada) return;
    time[campo] = Math.max(0, (time[campo] ?? 0) + delta);
    this.peladaService.atualizar(this.peladaSelecionada).subscribe();
  }

  getResultado(time: Time, campo: 'vitorias' | 'empates' | 'derrotas'): number {
    return time[campo] ?? 0;
  }

  getPontos(time: Time): number {
    return (time.vitorias ?? 0) * 3 + (time.empates ?? 0);
  }
}

