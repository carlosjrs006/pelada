import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PeladaService } from '../../services/pelada.service';
import { JogadorService } from '../../services/jogador.service';
import { PagamentoService } from '../../services/pagamento.service';
import { Pelada, Jogador, Pagamento } from '../../models/jogador.model';

@Component({
  selector: 'app-financeiro',
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.scss']
})
export class FinanceiroComponent implements OnInit {
  tabAtiva: 'mensalidades' | 'diarias' | 'acumulado' = 'mensalidades';

  peladas: Pelada[] = [];
  jogadores: Jogador[] = [];
  carregando = true;
  salvando = false;

  // Mensalidades
  mesAtual = '';
  mensalidades: Pagamento[] = [];
  carregandoMens = false;

  // Diárias
  peladaSelecionada: Pelada | null = null;
  diarias: Pagamento[] = [];
  carregandoDiarias = false;
  valorDiariaCampo: number = 25;

  // Acumulado
  todos: Pagamento[] = [];
  carregandoAcumulado = false;

  constructor(
    private peladaService: PeladaService,
    private jogadorService: JogadorService,
    private pagamentoService: PagamentoService
  ) {}

  ngOnInit(): void {
    const hoje = new Date();
    this.mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

    forkJoin({
      peladas: this.peladaService.getAll(),
      jogadores: this.jogadorService.getAll()
    }).subscribe(({ peladas, jogadores }) => {
      this.jogadores = jogadores;
      this.peladas = peladas.sort((a, b) => b.data.localeCompare(a.data));
      const hojeStr = new Date().toISOString().split('T')[0];
      const proxima = peladas.filter(p => p.data >= hojeStr).sort((a, b) => a.data.localeCompare(b.data))[0];
      this.peladaSelecionada = proxima ?? this.peladas[0] ?? null;
      this.carregando = false;
      this.carregarMensalidades();
    });
  }

  setTab(tab: 'mensalidades' | 'diarias' | 'acumulado'): void {
    this.tabAtiva = tab;
    if (tab === 'mensalidades') this.carregarMensalidades();
    else if (tab === 'diarias' && this.peladaSelecionada) this.carregarDiarias();
    else if (tab === 'acumulado') this.carregarAcumulado();
  }

  carregarAcumulado(): void {
    this.carregandoAcumulado = true;
    this.pagamentoService.getAll().subscribe(lista => {
      this.todos = lista;
      this.carregandoAcumulado = false;
    });
  }

  carregarMensalidades(): void {
    this.carregandoMens = true;
    this.pagamentoService.getMensalidades(this.mesAtual).subscribe(lista => {
      this.mensalidades = lista.sort((a, b) => {
        const ja = this.jogadores.find(j => j.id === a.jogadorId);
        const jb = this.jogadores.find(j => j.id === b.jogadorId);
        return (ja?.nome ?? '').localeCompare(jb?.nome ?? '');
      });
      this.carregandoMens = false;
    });
  }

  carregarDiarias(): void {
    if (!this.peladaSelecionada) return;
    this.carregandoDiarias = true;
    this.pagamentoService.getDiarias(this.peladaSelecionada.id).subscribe(lista => {
      this.diarias = lista.sort((a, b) => {
        const ja = this.jogadores.find(j => j.id === a.jogadorId);
        const jb = this.jogadores.find(j => j.id === b.jogadorId);
        return (ja?.nome ?? '').localeCompare(jb?.nome ?? '');
      });
      this.valorDiariaCampo = this.diarias[0]?.valor ?? 25;
      this.carregandoDiarias = false;
    });
  }

  mesAnterior(): void {
    const [ano, mes] = this.mesAtual.split('-').map(Number);
    const d = new Date(ano, mes - 2);
    this.mesAtual = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.carregarMensalidades();
  }

  mesPosterior(): void {
    const [ano, mes] = this.mesAtual.split('-').map(Number);
    const d = new Date(ano, mes);
    this.mesAtual = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.carregarMensalidades();
  }

  getMesLabel(): string {
    const [ano, mes] = this.mesAtual.split('-').map(Number);
    return new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  selecionarPelada(idx: number): void {
    this.peladaSelecionada = this.peladas[idx];
    this.carregarDiarias();
  }

  atualizarValorDiaria(): void {
    if (!this.peladaSelecionada || !this.valorDiariaCampo) return;
    this.salvando = true;
    this.pagamentoService.atualizarValorDiarias(this.peladaSelecionada.id, this.valorDiariaCampo)
      .subscribe(updated => {
        this.diarias = updated.sort((a, b) => {
          const ja = this.jogadores.find(j => j.id === a.jogadorId);
          const jb = this.jogadores.find(j => j.id === b.jogadorId);
          return (ja?.nome ?? '').localeCompare(jb?.nome ?? '');
        });
        this.salvando = false;
      });
  }

  togglePagamento(p: Pagamento): void {
    this.salvando = true;
    const req = p.pago ? this.pagamentoService.desfazer(p.id) : this.pagamentoService.pagar(p.id);
    req.subscribe(updated => {
      p.pago = updated.pago;
      p.dataPagamento = updated.dataPagamento;
      this.salvando = false;
    });
  }

  getJogador(jogadorId: number): Jogador | undefined {
    return this.jogadores.find(j => j.id === jogadorId);
  }

  getIniciais(nome: string): string {
    return nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  getTotalEsperado(lista: Pagamento[]): number {
    return lista.reduce((s, p) => s + (p.valor ?? 0), 0);
  }

  getTotalRecebido(lista: Pagamento[]): number {
    return lista.filter(p => p.pago).reduce((s, p) => s + (p.valor ?? 0), 0);
  }

  getTotalPendente(lista: Pagamento[]): number {
    return this.getTotalEsperado(lista) - this.getTotalRecebido(lista);
  }

  countPagos(lista: Pagamento[]): number {
    return lista.filter(p => p.pago).length;
  }

  getPercentual(lista: Pagamento[]): number {
    const total = this.getTotalEsperado(lista);
    if (total === 0) return 0;
    return Math.round((this.getTotalRecebido(lista) / total) * 100);
  }

  // ── Acumulado ──────────────────────────────────────────────

  get todosMensalidades(): Pagamento[] { return this.todos.filter(p => p.tipo === 'mensalidade'); }
  get todosDiarias(): Pagamento[]      { return this.todos.filter(p => p.tipo === 'diaria'); }

  get acumTotalRecebido(): number { return this.getTotalRecebido(this.todos); }
  get acumMensRecebido(): number  { return this.getTotalRecebido(this.todosMensalidades); }
  get acumDiarRecebido(): number  { return this.getTotalRecebido(this.todosDiarias); }

  /** Mensalidades pagas agrupadas por mês: [{mesAno, total}] ordenado desc */
  get mensalidadesPorMes(): { mesAno: string; label: string; recebido: number; esperado: number }[] {
    const meses = new Map<string, { recebido: number; esperado: number }>();
    for (const p of this.todosMensalidades) {
      const key = p.mesAno ?? p.referencia;
      if (!meses.has(key)) meses.set(key, { recebido: 0, esperado: 0 });
      const entry = meses.get(key)!;
      entry.esperado += p.valor ?? 0;
      if (p.pago) entry.recebido += p.valor ?? 0;
    }
    return Array.from(meses.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mesAno, v]) => {
        const [ano, mes] = mesAno.split('-').map(Number);
        const label = isNaN(mes) ? mesAno : new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return { mesAno, label, ...v };
      });
  }

  /** Diárias pagas agrupadas por pelada */
  get diariasPorPelada(): { data: string; local: string; recebido: number; esperado: number }[] {
    const grupos = new Map<number, { recebido: number; esperado: number }>();
    for (const p of this.todosDiarias) {
      const key = p.peladaId ?? 0;
      if (!grupos.has(key)) grupos.set(key, { recebido: 0, esperado: 0 });
      const entry = grupos.get(key)!;
      entry.esperado += p.valor ?? 0;
      if (p.pago) entry.recebido += p.valor ?? 0;
    }
    return Array.from(grupos.entries())
      .map(([peladaId, v]) => {
        const pelada = this.peladas.find(p => p.id === peladaId);
        const data = pelada ? pelada.data : `Pelada ${peladaId}`;
        return { data: pelada ? this.formatData(pelada.data) : `Pelada ${peladaId}`, local: pelada?.local ?? '', ...v };
      })
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  private formatData(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pt-BR');
  }
}
