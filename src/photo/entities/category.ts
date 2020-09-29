import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Photo } from './photo.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 250,
  })
  category: string;

  @ManyToOne(
    type => Photo,
    photo => photo.id,
  )
  photo: Photo;
}
