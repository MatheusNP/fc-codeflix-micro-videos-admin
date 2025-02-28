import { CastMember } from '@core/cast-member/domain/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.providers';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();

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
        .delete(`/cast-members/${id}`)
        .expect(expected.statusCode)
        .expect(expected);
    });
  });

  describe('/cast-members/:id (DELETE)', () => {
    it('should delete a cast member', async () => {
      const castMemberRepo = appHelper.app.get<ICastMemberRepository>(
        CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBERS_REPOSITORY.provide,
      );

      const castMember = CastMember.fake().aCastMember().build();
      await castMemberRepo.insert(castMember);

      await request(appHelper.app.getHttpServer())
        .delete(`/cast-members/${castMember.cast_member_id.id}`)
        .expect(204);

      await expect(
        castMemberRepo.findById(castMember.cast_member_id),
      ).resolves.toBeNull();
    });
  });
});
