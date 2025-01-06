import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePairEntity } from '../domain/game-pair.entity';
import { AnswerStatuses, GameStatuses } from '../api/models/input/create-pairs-status.input.model';
import { QuestionEntity } from '../domain/question.entity';
import { PlayerProgressEntity } from '../domain/player-progress.entity';
import { UserEntity } from '../../users/domain/user.entity';
import { AnswerEntity } from '../domain/answer.entity';
import { CreateQuestionInputModel } from '../api/models/input/create-question.input.model';
import { UpdatePublishStatusInputModel } from '../api/models/input/update-publish-status.input.model';


@Injectable()
export class QuizRepositoryTO {

  constructor(
    @InjectRepository(GamePairEntity) private readonly gRepository: Repository<GamePairEntity>,
    @InjectRepository(QuestionEntity) private readonly questionRepository: Repository<QuestionEntity>,
  ) {
  }

  async findOrCreateConnection(user: UserEntity): Promise<number> {
    const findLastGameForCurrentUser = await this.gRepository.find({
      where: { status: GameStatuses.Active },
      relations: ['firstPlayerProgress', 'secondPlayerProgress'],
    });
    for (const item of findLastGameForCurrentUser) {
      if (item.firstPlayerProgress.userId === user.id || item?.secondPlayerProgress?.userId === user.id) {
        throw new ForbiddenException('You cant connect because have an active game');
      }
    }
    let gamePair: GamePairEntity | null;
    gamePair = await this.gRepository.findOne({
      where: { status: GameStatuses.PendingSecondPlayer },
      relations: ['questions', 'firstPlayerProgress'],
    });
    if (!gamePair) {
      const newGame = new GamePairEntity();
      newGame.status = GameStatuses.PendingSecondPlayer;
      newGame.questions = null

      const firstPlayerProgress = new PlayerProgressEntity();
      firstPlayerProgress.userId = user.id;
      firstPlayerProgress.user = user;
      firstPlayerProgress.answers = [];
      newGame.firstPlayerProgress = firstPlayerProgress;
      newGame.secondPlayerProgressId = null;
      const createGame = await this.gRepository.save(newGame);
      return createGame.id;
    } else {
      if (gamePair.firstPlayerProgress.userId === user.id) {
        throw new ForbiddenException('You cant connect for your own game pair');
      }
      // const questions = await this.questionRepository.find();
      const questions = await this.questionRepository
        .createQueryBuilder('q')
        // .orderBy('RANDOM()')
        // .addOrderBy('q.id', 'ASC')
        .limit(5)
        .getMany();
      gamePair.status = GameStatuses.Active;
      gamePair.startGameDate = new Date(Date.now()).toISOString();
      gamePair.questions = questions
      const secondPlayerProgress = new PlayerProgressEntity();
      secondPlayerProgress.userId = user.id;
      secondPlayerProgress.user = user;
      secondPlayerProgress.answers = [];
      gamePair.secondPlayerProgress = secondPlayerProgress;
      const saveGame = await this.gRepository.save(gamePair);
      return saveGame.id;
    }
  }

  async getGame(user: UserEntity) {
    const findedGame = await this.gRepository.findOne({
      where: [
        { status: GameStatuses.Active, firstPlayerProgress: { userId: user.id } },
        { status: GameStatuses.Active, secondPlayerProgress: { userId: user.id } },
        { status: GameStatuses.PendingSecondPlayer, firstPlayerProgress: { userId: user.id } },
        { status: GameStatuses.PendingSecondPlayer, secondPlayerProgress: { userId: user.id } },
      ],
      relations: [
        'firstPlayerProgress.user',
        'secondPlayerProgress.user',
        'firstPlayerProgress.answers',
        'secondPlayerProgress.answers',
        'questions'
      ],
    });

    // const findedGame = await this.gRepository
    //   .createQueryBuilder('g')
    //   .innerJoinAndSelect('g.firstPlayerProgress', 'f')
    //   .leftJoinAndSelect('g.secondPlayerProgress', 's')
    //
    //   // .where('f.userId = :userId', { userId: user.id })
    //   // .orWhere('s.userId = :userId', { userId: user.id })
    //   // .andWhere('g.status = :status', { status: GameStatuses.Active })
    //   .orWhere('g.status = :status', { status: GameStatuses.PendingSecondPlayer })
    //   .getOne();
    if (!findedGame) {
      throw new NotFoundException('No game');
    }

    return findedGame;
  }

  async findGame(id: number, user: UserEntity) {
    if (!Number.isInteger(id)) {
      throw new BadRequestException('id is not integer');
    }
    const findedGame = await this.gRepository.findOne({
      where: { id },
      relations: [
        'firstPlayerProgress.user',
        'secondPlayerProgress.user',
        'firstPlayerProgress.answers',
        'secondPlayerProgress.answers',
        'questions'
      ],
    });
    if (!findedGame) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }
    if (findedGame?.firstPlayerProgress?.userId !== user.id && findedGame?.secondPlayerProgress?.userId !== user.id) {
      throw new ForbiddenException('User is not participate');
    }
    return findedGame;
  }

  async sendAnswer(answer: string, user: UserEntity) {
    let player: PlayerProgressEntity;
    let findedGame: GamePairEntity;
    try {
      findedGame = await this.getGame(user);
    } catch (e) {
      throw new ForbiddenException('No found game');
    }
    if (findedGame.status === GameStatuses.PendingSecondPlayer) {
      throw new ForbiddenException('No active pair');
    }
    if (findedGame?.firstPlayerProgress.userId !== user.id && findedGame?.secondPlayerProgress.userId !== user.id) {
      throw new ForbiddenException('User is not owner');
    }
    if (findedGame.firstPlayerProgress.userId === user.id) {
      player = findedGame.firstPlayerProgress;
    } else player = findedGame.secondPlayerProgress;
    if (player.answers.length >= 5) {
      throw new ForbiddenException('No more answers');
    }
    const newAnswer = new AnswerEntity();
    newAnswer.answerStatus = AnswerStatuses.Correct;
    newAnswer.question = findedGame.questions![findedGame.questions!.length - 5 + player.answers.length];
    newAnswer.playerId = player.user.id;
    newAnswer.body = answer;
    player.answers.push(newAnswer);
    // const question = await this.questionRepository.findOne({
    //   where: { id: newAnswer.questionId },
    // })
    // console.log('question: ', question);
    // console.log(question?.correctAnswers.includes(newAnswer.body));
    // if (question?.correctAnswers.includes(newAnswer.body)) {
    //   player.score++
    // }
    if (findedGame.firstPlayerProgress.userId === user.id) {
      findedGame.firstPlayerProgress = player;
    } else findedGame.secondPlayerProgress = player;
    let saveAnswer = await this.gRepository.save(findedGame);
    // console.log(newAnswer.question?.correctAnswers.includes(newAnswer.body));
    console.log('correctAnswers: ', newAnswer.question?.correctAnswers);
    console.log('answer: ', player.answers[player.answers.length - 1].body);
    // console.log('answerExists: ', newAnswer.question?.correctAnswers.includes(player.answers[player.answers.length - 1].body))
    const checkAnswer: string =  `${player.answers[player.answers.length - 1].body}`.toLowerCase()
    console.log('checkAnswer: ', checkAnswer);
    console.log('index: ', newAnswer.question.correctAnswers.indexOf(checkAnswer))
    // console.log(saveAnswer.questions![1]);
    if (saveAnswer.firstPlayerProgress.answers.length === 5 && saveAnswer.secondPlayerProgress.answers.length === 5) {
      // throw new NotFoundException('Game is finished');
      findedGame.status = GameStatuses.Finished;
      saveAnswer = await this.gRepository.save(findedGame);
    }
    if (findedGame.firstPlayerProgress.userId === user.id) {
      return saveAnswer.firstPlayerProgress.answers[saveAnswer.firstPlayerProgress.answers.length - 1].id;
    } else return saveAnswer.secondPlayerProgress.answers[saveAnswer.secondPlayerProgress.answers.length - 1].id;
  }

  //------------------------------------------------------------------------------------------//
  //-------------------------------------Questions--------------------------------------------//
  //------------------------------------------------------------------------------------------//

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
    const findedQuestion = await this.findQuestionById(id);
    Object.assign(findedQuestion, { ...questionData, updatedAt: new Date(Date.now()).toISOString() });
    return await this.questionRepository.save(findedQuestion);
  }

  async deleteQuestion(id: string) {
    const findedQuestion = await this.findQuestionById(id);
    return await this.questionRepository.delete(
      { id },
    );
  }

  async updateQuestionPublishStatus(id: string, updateData: UpdatePublishStatusInputModel) {
    const findedQuestion = await this.findQuestionById(id);
    findedQuestion.published = updateData.published;
    findedQuestion.updatedAt = new Date(Date.now()).toISOString();
    const updatedQuestion = await this.questionRepository.save(findedQuestion);
    return updatedQuestion;
  }

}
