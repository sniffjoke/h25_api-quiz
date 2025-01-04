import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { QuizService } from '../application/quiz.service';
import { GamePairViewModel } from './models/output/game-pair.view.model';
import {Request} from 'express';
import { CreateAnswerInputModel } from './models/input/create-answer.input.model';

@Controller('pair-game-quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('pairs/my-current')
  async getCurrentUnfUserGame() {
    return await this.quizService.getCurrentUnfGame();
  }

  @Get('pairs/:id')
  async getGameById(@Param('id') id: string) {
    return await this.quizService.findGameById(id);
  }

  @Post('pairs/connection')
  createOrConnectToConnection(@Req() req: Request) {
    return this.quizService.createOrConnect(req.headers.authorization as string);
  }

  @Post('pairs/my-current/answers')
  sendAnswer(@Body() answerData: CreateAnswerInputModel, @Req() req: Request) {
    return this.quizService.sendAnswer(answerData, req.headers.authorization as string);
  }

}
