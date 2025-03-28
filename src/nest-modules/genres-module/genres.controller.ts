import { GenreOutput } from '@core/genre/application/use-cases/common/genre-output';
import { CreateGenreUseCase } from '@core/genre/application/use-cases/create-genre/create-genre.use-case';
import { DeleteGenreUseCase } from '@core/genre/application/use-cases/delete-genre/delete-genre-use-case';
import { GetGenreUseCase } from '@core/genre/application/use-cases/get-genre/get-genre.use-case';
import { ListGenresUseCase } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';
import { UpdateGenreUseCase } from '@core/genre/application/use-cases/update-genre/update-genre.use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { SearchGenresDto } from './dto/search-genres.dto';
import { GenreCollectionPresenter, GenrePresenter } from './genres.presenter';

@Controller('genres')
export class GenresController {
  @Inject(CreateGenreUseCase)
  private createUseCase: CreateGenreUseCase;
  @Inject(UpdateGenreUseCase)
  private updateUseCase: UpdateGenreUseCase;
  @Inject(ListGenresUseCase)
  private listUseCase: ListGenresUseCase;
  @Inject(GetGenreUseCase)
  private getUseCase: GetGenreUseCase;
  @Inject(DeleteGenreUseCase)
  private deleteUseCase: DeleteGenreUseCase;

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    const output = await this.createUseCase.execute(createGenreDto);
    return GenresController.serialize(output);
  }

  @Get()
  async search(@Query() searchGenresDto: SearchGenresDto) {
    const output = await this.listUseCase.execute(searchGenresDto);
    return new GenreCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getUseCase.execute({ id });
    return GenresController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return await this.deleteUseCase.execute({ id });
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const output = await this.updateUseCase.execute({
      ...updateGenreDto,
      id,
    });
    return GenresController.serialize(output);
  }

  static serialize(output: GenreOutput) {
    return new GenrePresenter(output);
  }
}
