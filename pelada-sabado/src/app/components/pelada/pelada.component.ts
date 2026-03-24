import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PeladaService } from '../../services/pelada.service';
import { JogadorService } from '../../services/jogador.service';
import { Pelada, Jogador, PresencaPelada, TipoJogador, StatusJogo, ResultadoImportacao, NovoNomeDetectado } from '../../models/jogador.model';

@Component({
  selector: 'app-pelada',
  templateUrl: './pelada.component.html',
  styleUrls: ['./pelada.component.scss']
})
export class PeladaComponent implements OnInit {
  peladas: Pelada[] = [];
  peladaSelecionada: Pelada | null = null;
  jogadores: Jogador[] = [];
  tabAtiva: 'lista' | 'whatsapp' | 'gols' = 'lista';
  carregando = true;
  salvando = false;

  // WhatsApp import
  textoWhatsApp = '';
  estadoImport: 'input' | 'preview' | 'concluido' = 'input';
  resultado: ResultadoImportacao | null = null;
  nomesNovos: NovoNomeDetectado[] = [];

  novoNomeTemp: { nome: string; tipo: TipoJogador; estrelas: number; ativo: boolean } =
    { nome: '', tipo: 'convidado', estrelas: 3, ativo: true };
  nomeAdicionandoIdx: number | null = null;

  constructor(
    private peladaService: PeladaService,
    private jogadorService: JogadorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['tab'] === 'whatsapp') this.tabAtiva = 'whatsapp';
    });
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    forkJoin({
      peladas: this.peladaService.getAll(),
      jogadores: this.jogadorService.getAll()
    }).subscribe(({ peladas, jogadores }) => {
      this.peladas = peladas.sort((a, b) => b.data.localeCompare(a.data));
      this.jogadores = jogadores;
      const proxima = peladas.filter(p => p.data >= new Date().toISOString().split('T')[0])
        .sort((a, b) => a.data.localeCompare(b.data))[0];
      if (!this.peladaSelecionada) {
        // Prefere a próxima, senão pega a mais recente disponível
        this.peladaSelecionada = proxima ?? this.peladas[0] ?? null;
      } else {
        // Refresh da pelada selecionada
        const atualizada = peladas.find(p => p.id === this.peladaSelecionada!.id);
        if (atualizada) this.peladaSelecionada = atualizada;
      }
      this.carregando = false;
    });
  }

  /** IDs dos jogadores que têm presença registrada nesta pelada */
  private get idsNaPelada(): Set<number> {
    return new Set(this.peladaSelecionada?.presencas.map(p => p.jogadorId) ?? []);
  }

  get mensalistas(): Jogador[] {
    const ids = this.idsNaPelada;
    return this.jogadores.filter(j => j.tipo === 'mensalista' && j.ativo && ids.has(j.id));
  }
  get convidadosPelada(): Jogador[] {
    const ids = this.idsNaPelada;
    return this.jogadores.filter(j => j.tipo === 'convidado' && j.ativo && ids.has(j.id));
  }
  get goleiros(): Jogador[] {
    const ids = this.idsNaPelada;
    return this.jogadores.filter(j => j.tipo === 'goleiro' && j.ativo && ids.has(j.id));
  }

  get jogadoresDaPelada(): Jogador[] {
    const ids = this.idsNaPelada;
    return this.jogadores.filter(j => j.ativo && ids.has(j.id));
  }

  get totalGolsPelada(): number {
    return this.peladaSelecionada?.presencas.reduce((s, p) => s + (p.gols ?? 0), 0) ?? 0;
  }

  get totalAssistenciasPelada(): number {
    return this.peladaSelecionada?.presencas.reduce((s, p) => s + (p.assistencias ?? 0), 0) ?? 0;
  }

  getPresenca(jogadorId: number): PresencaPelada | undefined {
    return this.peladaSelecionada?.presencas.find(p => p.jogadorId === jogadorId);
  }

  getStatusIcon(jogadorId: number): string {
    const p = this.getPresenca(jogadorId);
    if (!p || p.status === 'pendente') return 'bi-circle text-secondary';
    if (p.status === 'confirmado') return 'bi-check-circle-fill text-success';
    if (p.status === 'ausente') return 'bi-x-circle-fill text-danger';
    if (p.status === 'atrasado') return 'bi-clock-fill text-warning';
    return 'bi-circle text-secondary';
  }

  getGols(jogadorId: number): number {
    return this.getPresenca(jogadorId)?.gols ?? 0;
  }

  getAssistencias(jogadorId: number): number {
    return this.getPresenca(jogadorId)?.assistencias ?? 0;
  }

  ajustarEstat(jogadorId: number, campo: 'gols' | 'assistencias', delta: number): void {
    if (!this.peladaSelecionada) return;
    const idx = this.peladaSelecionada.presencas.findIndex(p => p.jogadorId === jogadorId);
    if (idx < 0) return;
    const atual = this.peladaSelecionada.presencas[idx][campo] ?? 0;
    this.peladaSelecionada.presencas[idx][campo] = Math.max(0, atual + delta);
    this.peladaService.atualizar(this.peladaSelecionada).subscribe();
  }

  toggleStatus(jogadorId: number): void {
    if (!this.peladaSelecionada) return;
    const ciclo: Array<'pendente' | 'confirmado' | 'ausente' | 'atrasado'> =
      ['pendente', 'confirmado', 'ausente', 'atrasado'];
    const idx = this.peladaSelecionada.presencas.findIndex(p => p.jogadorId === jogadorId);
    if (idx >= 0) {
      const atual = this.peladaSelecionada.presencas[idx].status;
      const novoStatus = ciclo[(ciclo.indexOf(atual) + 1) % ciclo.length];
      this.peladaSelecionada.presencas[idx].status = novoStatus;
      this.peladaSelecionada.presencas[idx].multa = novoStatus === 'atrasado';
    } else {
      this.peladaSelecionada.presencas.push({ jogadorId, status: 'confirmado', multa: false });
    }
    this.peladaService.atualizar(this.peladaSelecionada).subscribe();
  }

  // ---- WhatsApp ----
  analisarLista(): void {
    if (!this.textoWhatsApp.trim()) return;
    this.resultado = this.peladaService.parsearListaCompleta(this.textoWhatsApp, this.jogadores);
    this.estadoImport = 'preview';
  }

  confirmarCriacaoPelada(): void {
    if (!this.resultado) return;
    this.salvando = true;
    const nomesParaCriar = this.resultado.nomesNovos;

    if (nomesParaCriar.length === 0) {
      this.peladaService.criarOuAtualizarDaLista(this.resultado, this.peladas).subscribe(pelada => {
        this._finalizarImport(pelada);
      });
      return;
    }

    // Cria todos os jogadores novos em paralelo e aguarda TODOS antes de salvar a pelada
    const criacoes$ = nomesParaCriar.map(item =>
      this.jogadorService.add({ nome: item.nome, tipo: item.tipo, estrelas: 3, ativo: true })
    );

    forkJoin(criacoes$).subscribe(novosJogadores => {
      const resultatoFinal: ResultadoImportacao = {
        ...this.resultado!,
        presencas: [
          ...this.resultado!.presencas,
          ...novosJogadores.map(j => ({ jogadorId: j.id, status: 'confirmado' as StatusJogo, multa: false }))
        ]
      };
      this.peladaService.criarOuAtualizarDaLista(resultatoFinal, this.peladas).subscribe(pelada => {
        this._finalizarImport(pelada);
      });
    });
  }

  private _finalizarImport(pelada: Pelada): void {
    this.peladaSelecionada = pelada;
    this.nomesNovos = [];
    this.salvando = false;
    this.estadoImport = 'concluido';
    const idx = this.peladas.findIndex(p => p.id === pelada.id);
    if (idx >= 0) this.peladas[idx] = pelada;
    else this.peladas.unshift(pelada);
    this.carregar();
  }

  resetarImport(): void {
    this.textoWhatsApp = '';
    this.resultado = null;
    this.estadoImport = 'input';
    this.nomesNovos = [];
    this.nomeAdicionandoIdx = null;
  }

  adicionarNovoNome(item: NovoNomeDetectado, idx: number): void {
    this.nomeAdicionandoIdx = idx;
    this.novoNomeTemp = { nome: item.nome, tipo: item.tipo, estrelas: 3, ativo: true };
  }

  confirmarNovoJogador(): void {
    this.jogadorService.add(this.novoNomeTemp).subscribe(novo => {
      if (this.peladaSelecionada) {
        this.peladaSelecionada.presencas.push({ jogadorId: novo.id, status: 'confirmado', multa: false });
        this.peladaService.atualizar(this.peladaSelecionada).subscribe();
      }
      if (this.nomeAdicionandoIdx !== null) this.nomesNovos.splice(this.nomeAdicionandoIdx, 1);
      this.nomeAdicionandoIdx = null;
      this.carregar();
    });
  }

  ignorarNome(idx: number): void {
    this.nomesNovos.splice(idx, 1);
  }

  // Helpers para o template de preview
  get totalConfirmados(): number {
    return this.resultado?.jogadoresExtraidos.filter(j => j.status === 'confirmado').length ?? 0;
  }
  get totalAusentes(): number {
    return this.resultado?.jogadoresExtraidos.filter(j => j.status === 'ausente').length ?? 0;
  }
  isNomeNovo(nome: string): boolean {
    return !!this.resultado?.nomesNovos.some(n => n.nome.toLowerCase() === nome.toLowerCase());
  }
  statusIconParse(status: string): string {
    if (status === 'confirmado') return 'bi-check-circle-fill text-success';
    if (status === 'ausente') return 'bi-x-circle-fill text-danger';
    return 'bi-circle text-secondary';
  }

  gerarWhatsApp(): void {
    if (!this.peladaSelecionada) return;
    const texto = this.peladaService.gerarTextoWhatsApp(this.peladaSelecionada, this.jogadores);
    navigator.clipboard.writeText(texto).then(() => alert('✅ Texto copiado! Cole no WhatsApp.'));
  }

  private proxSabado(): string {
    const hoje = new Date();
    const dias = (6 - hoje.getDay() + 7) % 7 || 7;
    const sabado = new Date(hoje);
    sabado.setDate(hoje.getDate() + dias);
    return sabado.toISOString().split('T')[0];
  }
}

