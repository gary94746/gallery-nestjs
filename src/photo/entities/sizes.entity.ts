import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Photo } from './photo.entity';

@Entity()
export class Sizes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  size: string;

  @Column()
  url: string;

  @ManyToOne(
    type => Photo,
    photo => photo.id,
  )
  photo: Photo;
}
