import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePairEntity } from '../domain/game-pair.entity';


@Injectable()
export class QuizQueryRepositoryTO {

  constructor(
    @InjectRepository(GamePairEntity) private readonly gRepository: Repository<GamePairEntity>,
  ) {
  }

  async getGame() {
    const items = await this.gRepository
      .createQueryBuilder('g')
      .getMany();
    console.log(items);
    return items;
  }
}
