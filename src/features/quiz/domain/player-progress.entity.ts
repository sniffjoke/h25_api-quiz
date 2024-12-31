import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerEntity } from './answer.entity';
import { UserEntity } from '../../users/domain/user.entity';


@Entity('playerProgress')
export class PlayerProgressEntity {
  @PrimaryGeneratedColumn()
  id: string;

  // @Column({default: 0})
  // score: number;
  //
  // @Column()
  // userId: string;
  //
  // @OneToOne(() => UserEntity, { onDelete: 'SET NULL' })
  // @JoinColumn()
  // user: UserEntity;

  // @OneToMany(() => AnswerEntity, (answer) => answer.playerProgress, {cascade: true})
  // @JoinColumn()
  // answers: AnswerEntity[]

}
