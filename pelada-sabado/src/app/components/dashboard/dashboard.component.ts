import { Component, OnInit } from '@angular/core';
import { PeladaService } from '../../services/pelada.service';
import { JogadorService } from '../../services/jogador.service';
import { Pelada } from '../../models/jogador.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  proxima: Pelada | undefined;
  totalJogadores = 0;
  confirmados = 0;
  pendentes = 0;
  carregando = true;

  constructor(
    private peladaService: PeladaService,
    private jogadorService: JogadorService
  ) {}

  ngOnInit(): void {
    this.jogadorService.getAll().subscribe(jogadores => {
      this.totalJogadores = jogadores.filter(j => j.ativo).length;
    });

    this.peladaService.getProxima().subscribe(pelada => {
      this.proxima = pelada;
      if (pelada) {
        this.confirmados = pelada.presencas.filter(p => p.status === 'confirmado').length;
        this.pendentes = pelada.presencas.filter(p => p.status === 'pendente').length;
      }
      this.carregando = false;
    });
  }

  get dataProxima(): string {
    if (!this.proxima) return '';
    const d = new Date(this.proxima.data + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  get diasRestantes(): number {
    if (!this.proxima) return 0;
    const hoje = new Date();
    const data = new Date(this.proxima.data + 'T12:00:00');
    return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }
}
