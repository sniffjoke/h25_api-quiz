import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePairEntity } from '../domain/game-pair.entity';
import { GameStatuses } from '../api/models/input/create-pairs-status.input.model';
import { QuestionEntity } from '../domain/question.entity';
import { PlayerProgressEntity } from '../domain/player-progress.entity';
import { UserEntity } from '../../users/domain/user.entity';


@Injectable()
export class QuizRepositoryTO {

  constructor(
    @InjectRepository(GamePairEntity) private readonly gRepository: Repository<GamePairEntity>,
    @InjectRepository(QuestionEntity) private readonly qRepository: Repository<QuestionEntity>
  ) {
  }

  async findOrCreateConnection(user: UserEntity) {
    let item;
    item = await this.gRepository.findOne({
      where: {status: GameStatuses.PendingSecondPlayer},
      relations: ['questions']
    })
    if (!item) {
      const questions = await this.qRepository.find()
      const gamePair = new GamePairEntity();
      gamePair.status = GameStatuses.PendingSecondPlayer;
      gamePair.questions = questions
      // item = await this.gRepository.save(gamePair);

      const firstPlayerProgress = new PlayerProgressEntity()
      firstPlayerProgress.userId = user.id;
      firstPlayerProgress.user = user
      firstPlayerProgress.answers = []
      gamePair.firstPlayerProgress = firstPlayerProgress
      item = await this.gRepository.save(gamePair);



      // item = await this.gRepository.manager.save(firstPlayerProgress);

    }
    return item;
  }
}
