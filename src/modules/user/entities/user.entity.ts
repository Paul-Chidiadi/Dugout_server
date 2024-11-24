import { League_Group } from 'src/modules/league/entities/league.entity';
import { Player } from 'src/modules/players/entities/players.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50 })
  email: string;

  @Column({ type: 'text', nullable: true })
  googleId: string;

  @Column({ default: false })
  onboarded: boolean;

  @Column({ length: 50, nullable: true })
  username: string;

  @Column({ length: 50, nullable: true })
  clubName: string;

  @Column({ length: 100, nullable: true })
  clubSlugName: string;

  @Column({ length: 100, nullable: true })
  clubColor: string;

  @Column({ length: 100, nullable: true })
  clubAbbrev: string;

  @Column({ type: 'json', nullable: true })
  preferences: any;

  @Column({ type: 'json', nullable: true })
  clubPlayers: any;

  @Column({ type: 'decimal', scale: 2, default: 0 })
  score: number;

  @ManyToOne(() => League_Group, (league_group) => league_group.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  leagueGroup: League_Group;

  @ManyToMany(() => Player)
  @JoinTable()
  draftedPlayers: Player[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
