import { Pipe, PipeTransform } from '@angular/core';
import { PresencaPelada } from '../models/jogador.model';

@Pipe({ name: 'presencaCount' })
export class PresencaCountPipe implements PipeTransform {
  transform(presencas: PresencaPelada[], status: string): number {
    return presencas.filter(p => p.status === status).length;
  }
}
