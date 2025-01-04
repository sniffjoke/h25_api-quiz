import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { GamePairEntity } from './game-pair.entity';
import { AnswerEntity } from './answer.entity';


@Entity('question')
export class QuestionEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  body: string

  // @Column(() => AnswerEntity)
  // correctAnswers: AnswerEntity[];

  @Column('text', {array: true})
  correctAnswers: string[];

  @Column({default: false})
  published: boolean

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ type: 'timestamp', default: null })
  updatedAt: string;

  // @OneToMany(() => AnswerEntity, (answer) => answer.question, {cascade: true})
  // answer: AnswerEntity;

}

// @Column()
// pairId: string;

// @ManyToOne(() => GamePairEntity, (gamePair) => gamePair.questions, {onDelete: 'CASCADE'})
// @JoinColumn({ name: 'pairId' })
// gamePair: GamePairEntity;
