import { Injectable } from '@nestjs/common';
import { GamePairViewModel } from '../api/models/output/game-pair.view.model';
import { QuizQueryRepositoryTO } from '../infrastructure/quiz.query-repository.to';
import { QuizRepositoryTO } from '../infrastructure/quiz.repository.to';
import { UsersService } from '../../users/application/users.service';

@Injectable()
export class QuizService {

  constructor(
    private readonly quizQueryRepository: QuizQueryRepositoryTO,
    private readonly quizRepository: QuizRepositoryTO,
    private readonly usersService: UsersService,
  ) {

  }

  async getCurrentUnfGame() {
    return await this.quizQueryRepository.getGame()
  }

  findGameById(id: number) {
    return `This action returns a #${id} quiz`;
  }

  async createOrConnect(bearerHeader: string) {
    const user = await this.usersService.getUserByAuthToken(bearerHeader)
    return await this.quizRepository.findOrCreateConnection(user)
  }

  sendAnswer(createQuizDto: GamePairViewModel) {
    return 'This action adds a new quiz';
  }

}
