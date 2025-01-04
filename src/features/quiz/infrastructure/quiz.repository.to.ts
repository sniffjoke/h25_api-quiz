import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePairEntity } from '../domain/game-pair.entity';
import { AnswerStatuses, GameStatuses } from '../api/models/input/create-pairs-status.input.model';
import { QuestionEntity } from '../domain/question.entity';
import { PlayerProgressEntity } from '../domain/player-progress.entity';
import { UserEntity } from '../../users/domain/user.entity';
import { AnswerEntity } from '../domain/answer.entity';
import { CreateQuestionInputModel } from '../api/models/input/create-question.input.model';
import { BlogCreateModel } from '../../blogs/api/models/input/create-blog.input.model';
import { UpdatePublishStatusInputModel } from '../api/models/input/update-publish-status.input.model';


@Injectable()
export class QuizRepositoryTO {

  constructor(
    @InjectRepository(GamePairEntity) private readonly gRepository: Repository<GamePairEntity>,
    @InjectRepository(QuestionEntity) private readonly questionRepository: Repository<QuestionEntity>,
  ) {
  }

  async findOrCreateConnection(user: UserEntity) {
    let gamePair;
    gamePair = await this.gRepository.findOne({
      where: { status: GameStatuses.PendingSecondPlayer },
      relations: ['questions', 'firstPlayerProgress'],
    });
    if (!gamePair) {
      const questions = await this.questionRepository.find();
      const newGame = new GamePairEntity();
      newGame.status = GameStatuses.PendingSecondPlayer;
      newGame.questions = questions;

      const firstPlayerProgress = new PlayerProgressEntity();
      firstPlayerProgress.userId = user.id;
      firstPlayerProgress.user = user;
      firstPlayerProgress.answers = [];
      newGame.firstPlayerProgress = firstPlayerProgress;
      return await this.gRepository.save(newGame);
    } else {
      if (gamePair.firstPlayerProgress.userId === user.id) {
        throw new BadRequestException('You cant connect for your own game pair');
      }
      gamePair.status = GameStatuses.Active;
      gamePair.startGameDate = new Date().toISOString();
      const secondPlayerProgress = new PlayerProgressEntity();
      secondPlayerProgress.userId = user.id;
      secondPlayerProgress.user = user;
      secondPlayerProgress.answers = [];
      gamePair.secondPlayerProgress = secondPlayerProgress;
      return await this.gRepository.save(gamePair);
    }
  }

  async findGame(id: string) {
    const findedGame = await this.gRepository.findOne({
      where: { id },
      relations: ['questions', 'firstPlayerProgress'],
    });
    if (!findedGame) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }
    return findedGame;
  }

  async sendAnswer(answer: string, user: UserEntity) {
    let player: UserEntity
    let findedGame = await this.gRepository.findOne({
      where: { status: GameStatuses.Active },
      relations: ['firstPlayerProgress.user', 'secondPlayerProgress.user', 'firstPlayerProgress.answers', 'secondPlayerProgress.answers'],
    });
    if (!findedGame) {
      throw new NotFoundException('No found game');
    }
    if (findedGame.firstPlayerProgress.userId === user.id) {
    player = findedGame.firstPlayerProgress.user
    } else player = findedGame.secondPlayerProgress.user
    const newAnswer = new AnswerEntity();
    newAnswer.answerStatus = AnswerStatuses.Correct
    newAnswer.questionId = '1'
    newAnswer.playerId = player.id;
    newAnswer.body = answer
    findedGame.firstPlayerProgress.answers.push(newAnswer)
    await this.gRepository.save(findedGame);
    console.log(newAnswer);
    return findedGame;
  }

  async createQuestion(questionData: CreateQuestionInputModel): Promise<string> {
    const question = new QuestionEntity();
    question.body = questionData.body;
    question.correctAnswers = questionData.correctAnswers;
    const newQuestion = await this.questionRepository.save(question);
    return newQuestion.id;
  }

  async findQuestionById(id: string) {
    const findedQuestion = await this.questionRepository.findOne({
      where: { id },
    });
    if (!findedQuestion) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
    return findedQuestion;
  }

  async updateQuestionById(id: string, questionData: Partial<CreateQuestionInputModel>) {
    const findedQuestion = await this.findQuestionById(id)
    Object.assign(findedQuestion, { ...questionData,  updatedAt: new Date().toISOString() });
    return await this.questionRepository.save(findedQuestion);
  }

  async deleteQuestion(id: string) {
    const findedQuestion = await this.findQuestionById(id);
    return await this.questionRepository.delete(
      { id },
    );
  }

  async updateQuestionPublishStatus(id: string, updateData: UpdatePublishStatusInputModel) {
    const findedQuestion = await this.findQuestionById(id)
    findedQuestion.published = updateData.published
    findedQuestion.updatedAt = new Date().toISOString()
    const updatedComment =  await this.questionRepository.save(findedQuestion);
    console.log(updatedComment);
    return updatedComment;
  }

}
