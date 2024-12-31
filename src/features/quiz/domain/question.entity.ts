import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GamePairEntity } from './game-pair.entity';
import { AnswerEntity } from './answer.entity';


@Entity('question')
export class QuestionEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  body: string

  @Column()
  pairId: string;

  @OneToOne(() => AnswerEntity, (answer) => answer.question, {cascade: true})
  answer: AnswerEntity;

  @ManyToOne(() => GamePairEntity, (gamePair) => gamePair.questions, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'pairId' })
  gamePair: GamePairEntity;
}
