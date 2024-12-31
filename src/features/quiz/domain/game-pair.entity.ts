import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameStatuses } from '../api/models/input/create-pairs-status.input.model';
import { QuestionEntity } from './question.entity';
import { PlayerProgressEntity } from './player-progress.entity';

@Entity('gamePair')
export class GamePairEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @OneToOne(() => PlayerProgressEntity, {cascade: true})
  @JoinColumn()
  firstPlayerProgress: PlayerProgressEntity;

  @OneToOne(() => PlayerProgressEntity, {cascade: true})
  @JoinColumn()
  secondPlayerProgress: PlayerProgressEntity;

  @Column()
  status: GameStatuses;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  pairCreatedDate: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startGameDate: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  finishGameDate: string;

  @OneToMany(() => QuestionEntity, (question) => question.gamePair, { cascade: true })
  questions: QuestionEntity[];
}
