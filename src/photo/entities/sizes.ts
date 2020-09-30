import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Photo } from './photo.entity';

@Entity()
export class Sizes {
  @PrimaryColumn('uuid')
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
