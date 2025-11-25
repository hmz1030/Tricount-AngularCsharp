import { Type } from 'class-transformer';

export class Tricount {
  id!: number;
  title!: string;
  description!: string | null;
  created_at!: string;
  creator!: number;
/*
  @Type(() => Participant)
  participants!: Participant[];

  @Type(() => Operation)
  operations!: Operation[];
*/
}