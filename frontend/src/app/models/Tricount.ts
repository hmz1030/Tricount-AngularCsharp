import { Type } from 'class-transformer';
import { Operation } from './Operation';

export class Tricount {
  id!: number;
  title!: string;
  description!: string | null;
  created_at!: string;
  creator!: number;
/*
  @Type(() => Participant)
  participants!: Participant[];
*/
  @Type(() => Operation)
  operations!: Operation[];

}