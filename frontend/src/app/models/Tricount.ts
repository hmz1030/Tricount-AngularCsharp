import { Type } from 'class-transformer';
import { Operation } from './Operation';
import { User } from './user';

export class Tricount {
  id!: number;
  title!: string;
  description!: string | null;
  created_at!: string;
  creator!: number;

  @Type(() => User)
  participants!: User[]; // on peut use directement model User, il a tout ce dont on a besoin

  @Type(() => Operation)
  operations!: Operation[];

}