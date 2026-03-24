import { Injectable } from '@angular/core';
import { Observable, map, switchMap, of } from 'rxjs';
import { Pelada, PresencaPelada, Time, Jogador, TipoJogador, ResultadoImportacao } from '../models/jogador.model';
import { ApiService } from './api.service';
import { JogadorService } from './jogador.service';

@Injectable({ providedIn: 'root' })
export class PeladaService {
  constructor(
    private api: ApiService,
    private jogadorService: JogadorService
  ) {}

  getAll(): Observable<Pelada[]> {
    return this.api.get<Pelada[]>('peladas');
  }

  getById(id: number): Observable<Pelada> {
    return this.api.get<Pelada>(`peladas/${id}`);
  }

  getProxima(): Observable<Pelada | undefined> {
    const hoje = new Date().toISOString().split('T')[0];
    return this.getAll().pipe(
      map(peladas => {
        const futura = peladas
          .filter(p => p.data >= hoje)
          .sort((a, b) => a.data.localeCompare(b.data))[0];
        // Se não há pelada futura, retorna a mais recente
        return futura ?? peladas.sort((a, b) => b.data.localeCompare(a.data))[0];
      })
    );
  }

  criar(pelada: Omit<Pelada, 'id' | 'criadoEm' | 'times'>): Observable<Pelada> {
    return this.api.post<Pelada>('peladas', {
      ...pelada,
      times: [],
      criadoEm: new Date().toISOString()
    });
  }

  atualizar(pelada: Pelada): Observable<Pelada> {
    return this.api.put<Pelada>('peladas', pelada.id, pelada);
  }

  /**
   * Parse COMPLETO da lista do WhatsApp.
   * Extrai: data, local, horário, valores, PIX, jogadores e status.
   * Retorna as presenças dos cadastrados + nomes novos detectados.
   */
  parsearListaCompleta(texto: string, jogadores: Jogador[]): ResultadoImportacao {
    const linhas = texto.split('\n');

    // ── Metadados da pelada ──────────────────────────────────────────────
    let data = '';
    let local = 'ARENA STILLUS';
    let horario = '08:30';
    let valorMensalista = 70;
    let valorDiaria = 25;
    let valorMulta = 15;
    let pix = '';

    for (const linha of linhas) {
      const l = linha.trim();

      // Data: "Pelada de Sábado 21/03/2026"
      if (!data) {
        const m = l.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (m) data = `${m[3]}-${m[2]}-${m[1]}`;
      }

      // Local: "Local: ARENA STILLUS"
      const mLocal = l.match(/^Local:\s*(.+)/i);
      if (mLocal) local = mLocal[1].trim();

      // Horário: "HORÁRIO: 8:30" ou "HORARIO: 08:30"
      const mHorario = l.match(/HOR[AÁ]RIO:\s*(\S+)/i);
      if (mHorario) horario = mHorario[1].replace(',', ':').trim();

      // Mensalista: "Mensalista: R$ 70,00"
      const mMens = l.match(/Mensalista[^R]*R\$\s*([\d.,]+)/i);
      if (mMens) valorMensalista = parseFloat(mMens[1].replace(',', '.'));

      // Diária: "Diária: R$: 25,00" ou "Diária: R$ 25,00"
      const mDiaria = l.match(/Di[áa]ria[^R]*R\$[:\s]*([\d.,]+)/i);
      if (mDiaria) valorDiaria = parseFloat(mDiaria[1].replace(',', '.'));

      // PIX
      const mPix = l.match(/PIX:\s*(\S+)/i);
      if (mPix) pix = mPix[1].trim();

      // Multa: "multa de uma diária R$ 15,00"
      const mMulta = l.match(/multa[^R]*R\$\s*([\d.,]+)/i);
      if (mMulta) valorMulta = parseFloat(mMulta[1].replace(',', '.'));
    }

    // ── Jogadores ───────────────────────────────────────────────────────
    const jogadoresExtraidos: Array<{ nome: string; tipo: TipoJogador; status: 'confirmado' | 'ausente' | 'pendente' }> = [];
    const presencas: PresencaPelada[] = [];
    let secao: TipoJogador = 'mensalista';

    for (const linha of linhas) {
      const l = linha.trim();

      if (/^Mensalistas?:/i.test(l)) { secao = 'mensalista'; continue; }
      if (/^Convidados?:/i.test(l))  { secao = 'convidado';  continue; }
      if (/^Goleiros?:/i.test(l))    { secao = 'goleiro';    continue; }

      const match = l.match(/^\d+\s*[-–]\s*(.+)/);
      if (!match) continue;

      let parte = match[1].trim();

      // Tipo: herda seção, mas "(convidado)" força convidado
      let tipo: TipoJogador = secao;
      if (/\(convidado\)/i.test(parte)) tipo = 'convidado';

      // Status
      let status: 'confirmado' | 'ausente' | 'pendente' = 'pendente';
      if (parte.includes('✅')) status = 'confirmado';
      else if (parte.includes('❌')) status = 'ausente';

      // Limpar nome
      const nome = parte.replace(/\(convidado\)/gi, '').replace(/[✅❌]/g, '').trim();
      if (!nome) continue; // slot vazio

      jogadoresExtraidos.push({ nome, tipo, status });

      const jogador = this.jogadorService.findByNome(nome, jogadores);
      if (jogador) presencas.push({ jogadorId: jogador.id, status, multa: false });
    }

    // Nomes não cadastrados
    const nomesNovos = jogadoresExtraidos
      .filter(({ nome }) => !jogadores.some(j => j.nome.toLowerCase() === nome.toLowerCase()))
      .map(({ nome, tipo }) => ({ nome, tipo }));

    return {
      dadosPelada: { data, local, horario, valorMensalista, valorDiaria, valorMulta, pix },
      presencas,
      nomesNovos,
      jogadoresExtraidos,
    };
  }

  /**
   * Cria uma nova pelada OU atualiza presenças de uma existente com a mesma data.
   * Recebe o resultado do parser e os jogadores cadastrados.
   */
  criarOuAtualizarDaLista(resultado: ResultadoImportacao, peladas: Pelada[]): Observable<Pelada> {
    const { dadosPelada, presencas } = resultado;
    const existente = peladas.find(p => p.data === dadosPelada.data);

    if (existente) {
      // Mescla presenças
      const novasPresencas = [...existente.presencas];
      for (const p of presencas) {
        const idx = novasPresencas.findIndex(x => x.jogadorId === p.jogadorId);
        if (idx >= 0) novasPresencas[idx] = p;
        else novasPresencas.push(p);
      }
      return this.atualizar({ ...existente, ...dadosPelada, presencas: novasPresencas });
    }

    return this.criar({ ...dadosPelada, presencas });
  }

  /**
   * @deprecated Use parsearListaCompleta + criarOuAtualizarDaLista
   * Mantido para compatibilidade.
   */
  parsearListaWhatsApp(texto: string, jogadores: Jogador[]): { presencas: PresencaPelada[]; nomesNovos: string[] } {
    const r = this.parsearListaCompleta(texto, jogadores);
    return { presencas: r.presencas, nomesNovos: r.nomesNovos.map(n => n.nome) };
  }

  /**
   * Sorteia times equilibrados usando snake draft baseado nas estrelas.
   */
  sortearTimes(pelada: Pelada, jogadores: Jogador[], porTime: number = 6): Observable<Pelada> {
    const confirmados = pelada.presencas
      .filter(p => p.status === 'confirmado' || p.status === 'atrasado')
      .map(p => jogadores.find(j => j.id === p.jogadorId))
      .filter((j): j is Jogador => !!j && j.tipo !== 'goleiro')
      .sort((a, b) => b.estrelas - a.estrelas);

    const qtdTimes = Math.floor(confirmados.length / porTime);
    if (qtdTimes < 2) return of({ ...pelada, times: [] });

    const cores = ['#e63946', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];
    const times: Time[] = Array.from({ length: qtdTimes }, (_, i) => ({
      id: i + 1,
      nome: `Time ${String.fromCharCode(65 + i)}`,
      cor: cores[i] || '#607D8B',
      jogadores: []
    }));

    // Somente os jogadores que cabem nos times principais (porTime * qtdTimes)
    const paraDistribuir = confirmados.slice(0, qtdTimes * porTime);
    const reservas = confirmados.slice(qtdTimes * porTime);

    // Snake draft para balancear estrelas entre os times
    let esquerda = true;
    for (let i = 0; i < paraDistribuir.length; i++) {
      if (i > 0 && i % qtdTimes === 0) esquerda = !esquerda;
      const idx = esquerda ? i % qtdTimes : qtdTimes - 1 - (i % qtdTimes);
      if (times[idx]) times[idx].jogadores.push(paraDistribuir[i].id);
    }

    // Time de reservas (sobra)
    if (reservas.length > 0) {
      times.push({
        id: qtdTimes + 1,
        nome: 'Reservas',
        cor: '#607D8B',
        jogadores: reservas.map(j => j.id)
      });
    }

    // Atribuir goleiros
    const goleiros = pelada.presencas
      .filter(p => p.status === 'confirmado' || p.status === 'atrasado')
      .map(p => jogadores.find(j => j.id === p.jogadorId))
      .filter((j): j is Jogador => !!j && j.tipo === 'goleiro');
    goleiros.forEach((g, i) => { if (times[i]) times[i].goleiro = g.id; });

    const peladaAtualizada = { ...pelada, times };
    return this.atualizar(peladaAtualizada);
  }

  gerarTextoWhatsApp(pelada: Pelada, jogadores: Jogador[]): string {
    const data = new Date(pelada.data + 'T12:00:00');
    const dataFmt = data.toLocaleDateString('pt-BR');
    const emoji = (s: string) => s === 'confirmado' ? '✅' : s === 'ausente' ? '❌' : '';

    const porTipo = (tipo: string) =>
      pelada.presencas
        .map(p => ({ ...p, j: jogadores.find(j => j.id === p.jogadorId) }))
        .filter(p => p.j?.tipo === tipo);

    let txt = `⚽ *Pelada de Sábado ${dataFmt}*\n\n`;
    txt += `📍 Local: ${pelada.local}\n\n`;
    txt += `💰 Acertar com a tesouraria antes do jogo:\n`;
    txt += `Mensalista: R$ ${pelada.valorMensalista.toFixed(2)}\n`;
    txt += `Diária: R$ ${pelada.valorDiaria.toFixed(2)}\n`;
    txt += `PIX: ${pelada.pix}\n\n`;
    txt += `🕐 HORÁRIO: ${pelada.horario}\n\n`;

    txt += `*Mensalistas:*\n`;
    porTipo('mensalista').forEach((p, i) => { txt += `${i + 1} - ${p.j?.nome} ${emoji(p.status)}\n`; });

    const conv = porTipo('convidado');
    if (conv.length) {
      txt += `\n*Convidados:*\n`;
      conv.forEach((p, i) => { txt += `${i + 1} - ${p.j?.nome} (convidado) ${emoji(p.status)}\n`; });
    }

    const gols = porTipo('goleiro');
    if (gols.length) {
      txt += `\n*Goleiros:*\n`;
      gols.forEach((p, i) => { txt += `${i + 1} - ${p.j?.nome} ${emoji(p.status)}\n`; });
    }

    txt += `\n⚠️ Colocar o nome na lista e não comparecer: multa R$ ${pelada.valorMulta.toFixed(2)}`;
    return txt;
  }
}

