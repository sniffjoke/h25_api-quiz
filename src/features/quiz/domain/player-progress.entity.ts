import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerEntity } from './answer.entity';
import { UserEntity } from '../../users/domain/user.entity';


@Entity('playerProgress')
export class PlayerProgressEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({default: 0})
  score: number;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({name: 'userId'})
  user: UserEntity;

  @OneToMany(() => AnswerEntity, (answer) => answer.playerProgress, {cascade: true})
  answers: AnswerEntity[]

}
