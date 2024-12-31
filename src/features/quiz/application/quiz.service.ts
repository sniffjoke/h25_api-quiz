import { Injectable } from '@nestjs/common';
import { GamePairViewModel } from '../api/models/output/game-pair.view.model';
import { QuizQueryRepositoryTO } from '../infrastructure/quiz.query-repository.to';

@Injectable()
export class QuizService {

  constructor(
    private readonly quizQueryRepository: QuizQueryRepositoryTO
  ) {

  }

  async getCurrentUnfGame() {
    return await this.quizQueryRepository.getGame()
  }

  findGameById(id: number) {
    return `This action returns a #${id} quiz`;
  }

  createOrConnect(createQuizDto: GamePairViewModel) {
    return 'This action adds a new quiz';
  }

  sendAnswer(createQuizDto: GamePairViewModel) {
    return 'This action adds a new quiz';
  }

}
