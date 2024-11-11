import { LEAGUE_STATUS, LEAGUE_VISIBILITY } from 'src/common/enums/league.enum';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('league_group')
export class League_Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'decimal', scale: 2, default: 0 })
  entryFee: number;

  @Column({
    type: 'enum',
    enum: ['created', 'drafting', 'upcoming', 'started'],
    default: LEAGUE_STATUS.CREATED,
  })
  status: LEAGUE_STATUS;

  @Column({
    type: 'enum',
    enum: ['public', 'private'],
    default: LEAGUE_VISIBILITY.PUBLIC,
  })
  visibility: LEAGUE_VISIBILITY;

  @Column({ type: 'varchar', nullable: true })
  accessKey: string;

  @OneToMany(() => User, (user) => user.leagueGroup, {
    cascade: true,
  })
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
