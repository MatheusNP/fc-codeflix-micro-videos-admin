import { CastMemberOutput } from '@core/cast-member/application/use-cases/common/cast-member-output';
import { CreateCastMemberUseCase } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { DeleteCastMemberUseCase } from '@core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { GetCastMemberUseCase } from '@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersUseCase } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { UpdateCastMemberUseCase } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
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
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from './cast-members.presenter';
import { UpdateCastMemberDto } from './dto/update-cast-member.dto';
import { CreateCastMemberDto } from './dto/create-cast-member.dto';
import { SearchCastMembersDto } from './dto/search-cast-members.dto';

@Controller('cast-members')
export class CastMembersController {
  @Inject(CreateCastMemberUseCase)
  private createCastMemberUseCase: CreateCastMemberUseCase;
  @Inject(ListCastMembersUseCase)
  private listCastMembersUseCase: ListCastMembersUseCase;
  @Inject(GetCastMemberUseCase)
  private getCastMemberUseCase: GetCastMemberUseCase;
  @Inject(UpdateCastMemberUseCase)
  private updateCastMemberUseCase: UpdateCastMemberUseCase;
  @Inject(DeleteCastMemberUseCase)
  private deleteCastMemberUseCase: DeleteCastMemberUseCase;

  @Post()
  async create(@Body() createCastMemberDto: CreateCastMemberDto) {
    const output =
      await this.createCastMemberUseCase.execute(createCastMemberDto);
    return CastMembersController.serialize(output);
  }

  @Get()
  async search(@Query() searchCastMembersDto: SearchCastMembersDto) {
    console.log('searchCastMembersDto: ', JSON.stringify(searchCastMembersDto));
    const output =
      await this.listCastMembersUseCase.execute(searchCastMembersDto);
    return new CastMemberCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getCastMemberUseCase.execute({ id });
    return CastMembersController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateCastMemberDto: UpdateCastMemberDto,
  ) {
    const output = await this.updateCastMemberUseCase.execute({
      ...updateCastMemberDto,
      id,
    });
    return CastMembersController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return await this.deleteCastMemberUseCase.execute({ id });
  }

  static serialize(output: CastMemberOutput) {
    return new CastMemberPresenter(output);
  }
}
