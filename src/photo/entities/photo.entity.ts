import { PrimaryGeneratedColumn, Entity, Column, OneToMany } from 'typeorm';
import { Category } from './category';
import { Sizes } from './sizes';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 300 })
  alt_description: string;

  @Column({
    type: 'varchar',
    length: 300,
  })
  name: string;

  @Column({
    default: new Date(),
  })
  createdAt: Date;

  @Column({
    type: 'varchar',
    length: 500,
  })
  description: string;

  @OneToMany(
    type => Category,
    category => category.id,
  )
  categories: Category[];

  @OneToMany(
    type => Sizes,
    sizes => sizes.id,
  )
  sizes: Sizes[];
}
