import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member-output';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { instanceToPlain } from 'class-transformer';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.providers';
import { GetCastMemberFixture } from 'src/nest-modules/cast-members-module/testing/cast-member-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();

  describe('/cast-members/:id (GET)', () => {
    describe('should return 4XX when id is invalid or not found', () => {
      const arrange = [
        {
          id: '97aa09d0-c558-4cf4-9b30-37ce631119d5',
          expected: {
            statusCode: 404,
            message:
              'CastMember Not Found using ID 97aa09d0-c558-4cf4-9b30-37ce631119d5',
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .get(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should get a cast member', async () => {
      const castMemberRepo = appHelper.app.get<ICastMemberRepository>(
        CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBERS_REPOSITORY.provide,
      );

      const castMember = CastMember.fake().aCastMember().build();
      await castMemberRepo.insert(castMember);

      const res = await request(appHelper.app.getHttpServer())
        .get(`/cast-members/${castMember.cast_member_id.id}`)
        .expect(200);

      const keysInResponse = GetCastMemberFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

      const presenter = CastMembersController.serialize(
        CastMemberOutputMapper.toOutput(castMember),
      );
      const serialized = instanceToPlain(presenter);

      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});
