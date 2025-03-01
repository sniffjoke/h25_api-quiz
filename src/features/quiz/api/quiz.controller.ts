import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, HttpCode } from '@nestjs/common';
import { QuizService } from '../application/quiz.service';
import { GamePairViewModel } from './models/output/game-pair.view.model';
import {Request} from 'express';
import { CreateAnswerInputModel } from './models/input/create-answer.input.model';
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { QuizQueryRepositoryTO } from '../infrastructure/quiz.query-repository.to';

@Controller('pair-game-quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly quizQueryRepository: QuizQueryRepositoryTO
  ) {}

  @Get('pairs/my-current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUnfUserGame(@Req() req: Request): Promise<GamePairViewModel> {
    const findedGame = await this.quizService.getCurrentUnfGame(req.headers.authorization as string);
    // console.log('findedGame: ', findedGame);
    return this.quizQueryRepository.gamePairOutputMap(findedGame)
  }

  @Get('pairs/:id')
  @UseGuards(JwtAuthGuard)
  async getGameById(@Param('id') id: number, @Req() req: Request): Promise<GamePairViewModel> {
    const findedGame = await this.quizService.findGameById(id, req.headers.authorization as string);
    return this.quizQueryRepository.gamePairOutputMap(findedGame)
  }

  @Post('pairs/connection')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async createOrConnectToConnection(@Req() req: Request): Promise<GamePairViewModel> {
    const gameId = await this.quizService.createOrConnect(req.headers.authorization as string);
    const findedGame = await this.quizQueryRepository.gameOutput(gameId)
    return findedGame
  }

  @Post('pairs/my-current/answers')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async sendAnswer(@Body() answerData: CreateAnswerInputModel, @Req() req: Request) {
    const answerId = await this.quizService.sendAnswer(answerData, req.headers.authorization as string);
    return this.quizQueryRepository.answerOutput(answerId)
  }

}
