import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
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
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: string;

  @Column({
    type: 'varchar',
    length: 500,
  })
  description: string;

  @ManyToMany(type => Category)
  @JoinTable()
  categories: Category[];

  @OneToMany(
    type => Sizes,
    sizes => sizes.id,
  )
  sizes: Sizes[];
}
