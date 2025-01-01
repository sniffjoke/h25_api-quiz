import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePairEntity } from '../domain/game-pair.entity';
import { GameStatuses } from '../api/models/input/create-pairs-status.input.model';


@Injectable()
export class QuizQueryRepositoryTO {

  constructor(
    @InjectRepository(GamePairEntity) private readonly gRepository: Repository<GamePairEntity>,
  ) {
  }

  async getGame() {
    const item = await this.gRepository
      .createQueryBuilder('g')
      .where('g.status = :status', {status: GameStatuses.Active})
      .getOne();
    // console.log(items);
    return item;
  }
}
