import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerStatuses } from '../api/models/input/create-pairs-status.input.model';
import { QuestionEntity } from './question.entity';
import { PlayerProgressEntity } from './player-progress.entity';


@Entity('answer')
export class AnswerEntity {

  @PrimaryColumn()
  questionId: string;

  @Column()
  playerId: string;

  @Column()
  answerStatus: AnswerStatuses

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: string

  @OneToOne(() => QuestionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: QuestionEntity;

  @ManyToOne(() => PlayerProgressEntity, (playerProgress) => playerProgress.answers,  { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  playerProgress: PlayerProgressEntity;

}
