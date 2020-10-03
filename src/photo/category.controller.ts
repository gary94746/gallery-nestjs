import { Controller, Get } from '@nestjs/common';
import { PhotoService } from './photo.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: PhotoService) {}

  @Get()
  async getCategories() {
    return this.categoryService.findAllCategories();
  }
}
