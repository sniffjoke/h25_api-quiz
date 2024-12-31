import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuizService } from '../application/quiz.service';
import { GamePairViewModel } from './models/output/game-pair.view.model';

@Controller('pair-game-quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('pairs/my-current')
  async getCurrentUnfUserGame() {
    return await this.quizService.getCurrentUnfGame();
  }

  @Get('pairs/:id')
  getGameById(@Param('id') id: string) {
    return this.quizService.findGameById(+id);
  }

  @Post('pairs/connection')
  createOrConnectToConnection(@Body() createQuizDto: GamePairViewModel) {
    return this.quizService.createOrConnect(createQuizDto);
  }

  @Post('pairs/my-current/answers')
  sendAnswer(@Body() createQuizDto: GamePairViewModel) {
    return this.quizService.sendAnswer(createQuizDto);
  }

}