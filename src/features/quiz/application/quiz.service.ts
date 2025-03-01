import { Injectable } from '@nestjs/common';
import { GamePairViewModel } from '../api/models/output/game-pair.view.model';
import { QuizQueryRepositoryTO } from '../infrastructure/quiz.query-repository.to';
import { QuizRepositoryTO } from '../infrastructure/quiz.repository.to';
import { UsersService } from '../../users/application/users.service';
import { CreateAnswerInputModel } from '../api/models/input/create-answer.input.model';
import { CreateQuestionInputModel } from '../api/models/input/create-question.input.model';
import { UpdatePublishStatusInputModel } from '../api/models/input/update-publish-status.input.model';

@Injectable()
export class QuizService {

  constructor(
    private readonly quizQueryRepository: QuizQueryRepositoryTO,
    private readonly quizRepository: QuizRepositoryTO,
    private readonly usersService: UsersService,
  ) {

  }

  async getCurrentUnfGame(bearerHeader: string) {
    const user = await this.usersService.getUserByAuthToken(bearerHeader)
    return await this.quizRepository.getGame(user);
  }

  async findGameById(id: number, bearerHeader: string) {
    const user = await this.usersService.getUserByAuthToken(bearerHeader);
    return await this.quizRepository.findGame(id, user);
  }

  async createOrConnect(bearerHeader: string): Promise<number> {
    const user = await this.usersService.getUserByAuthToken(bearerHeader);
    return await this.quizRepository.findOrCreateConnection(user);
  }

  async sendAnswer(answerData: CreateAnswerInputModel, bearerHeader: string) {
    const user = await this.usersService.getUserByAuthToken(bearerHeader);
    return await this.quizRepository.sendAnswer(answerData.answer, user);
  }

  async createNewQuestion(questionData: CreateQuestionInputModel): Promise<string> {
    const newQuestionId = await this.quizRepository.createQuestion(questionData);
    return newQuestionId;
  }

  async updateQuestionById(id: string, questionData: Partial<CreateQuestionInputModel>) {
    return await this.quizRepository.updateQuestionById(id, questionData);
  }

  async deleteQuestion(id: string) {
    return await this.quizRepository.deleteQuestion(id);
  }

  async updateQuestionPublish(id: string, updateData: UpdatePublishStatusInputModel) {
    return await this.quizRepository.updateQuestionPublishStatus(id, updateData);
  }

}
