export type StatusJogo = 'confirmado' | 'ausente' | 'pendente' | 'atrasado';
export type TipoJogador = 'mensalista' | 'convidado' | 'goleiro';

export interface Jogador {
  id: number;
  nome: string;
  estrelas: number; // 1-5
  tipo: TipoJogador;
  numero?: number;
  ativo: boolean;
  criadoEm: string;
}

export interface PresencaPelada {
  jogadorId: number;
  status: StatusJogo;
  multa: boolean;
  pagou?: boolean;
  gols?: number;
  assistencias?: number;
}

export interface Pelada {
  id: number;
  data: string; // ISO date
  local: string;
  horario: string;
  valorMensalista: number;
  valorDiaria: number;
  valorMulta: number;
  pix: string;
  presencas: PresencaPelada[];
  times: Time[];
  criadoEm: string;
}

export interface Time {
  id: number;
  nome: string;
  cor: string;
  jogadores: number[]; // array de jogadorId
  goleiro?: number;
  vitorias?: number;
  empates?: number;
  derrotas?: number;
}

export interface Pagamento {
  id: number;
  jogadorId: number;
  tipo: 'mensalidade' | 'diaria';
  referencia: string;
  mesAno?: string;
  peladaId?: number;
  valor: number;
  pago: boolean;
  dataPagamento?: string;
  criadoEm: string;
}

export interface NovoNomeDetectado {
  nome: string;
  tipo: TipoJogador;
}

export interface ResultadoImportacao {
  dadosPelada: {
    data: string;
    local: string;
    horario: string;
    valorMensalista: number;
    valorDiaria: number;
    valorMulta: number;
    pix: string;
  };
  presencas: PresencaPelada[];
  nomesNovos: NovoNomeDetectado[];
  jogadoresExtraidos: Array<{ nome: string; tipo: TipoJogador; status: StatusJogo }>;
}
